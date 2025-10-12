"""API v1 routes"""

from fastapi import APIRouter

from .endpoints import videos, content, health

api_router = APIRouter()

# Include route modules
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(content.router, prefix="/content", tags=["content"])

