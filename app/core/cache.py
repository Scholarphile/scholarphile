"""Caching utilities with Redis (async) and in-memory fallback"""

from __future__ import annotations

import asyncio
import time
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

try:
    # Redis 4+/5+ provides asyncio client under redis.asyncio
    import redis.asyncio as redis  # type: ignore
except Exception:  # pragma: no cover - optional dependency during local dev
    redis = None  # type: ignore


class AsyncCache:
    """Simple async cache facade with Redis and in-memory fallback."""

    def __init__(self, url: str, default_ttl: int) -> None:
        self._url = url
        self._default_ttl = default_ttl
        self._client: Optional["redis.Redis[str]"] = None
        self._initialized = False
        self._init_lock = asyncio.Lock()
        # In-memory fallback store: key -> (value, expires_epoch_seconds)
        self._memory_store: dict[str, tuple[str, float]] = {}

    async def _ensure_client(self) -> None:
        if self._initialized:
            return
        async with self._init_lock:
            if self._initialized:
                return
            if redis is None:
                logger.info("redis_not_installed_falling_back_to_memory")
                self._initialized = True
                return
            try:
                self._client = redis.from_url(self._url, decode_responses=True)
                # Verify connection
                await self._client.ping()
                logger.info("redis_connected", url=self._url)
            except Exception as exc:  # pragma: no cover
                logger.warning("redis_unavailable_falling_back_to_memory", error=str(exc))
                self._client = None
            finally:
                self._initialized = True

    async def get(self, key: str) -> Optional[str]:
        await self._ensure_client()
        if self._client is not None:
            try:
                return await self._client.get(key)
            except Exception as exc:  # pragma: no cover
                logger.warning("redis_get_failed", error=str(exc))
                # fall through to memory
        # Memory fallback
        item = self._memory_store.get(key)
        if not item:
            return None
        value, expires = item
        if expires < time.time():
            self._memory_store.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> None:
        await self._ensure_client()
        effective_ttl = ttl or self._default_ttl
        if self._client is not None:
            try:
                await self._client.set(key, value, ex=effective_ttl)
                return
            except Exception as exc:  # pragma: no cover
                logger.warning("redis_set_failed", error=str(exc))
                # fall through to memory
        # Memory fallback
        self._memory_store[key] = (value, time.time() + float(effective_ttl))


# Export a singleton cache instance
cache = AsyncCache(settings.redis_url, settings.cache_ttl)
