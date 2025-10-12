"""Application configuration management"""

from typing import List
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # API Configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Scholarphile"
    version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    database_url: str = Field(..., description="PostgreSQL connection string")
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl: int = 3600
    
    # YouTube API
    youtube_api_key: str = Field(..., description="YouTube Data API v3 key")
    youtube_quota_limit: int = 10000
    
    # Security
    secret_key: str = Field(..., description="Secret key for JWT encoding")
    allowed_origins: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # Sentry (optional)
    sentry_dsn: str | None = None
    
    # Logging
    log_level: str = "INFO"
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as strings"""
        return [str(origin) for origin in self.allowed_origins]


settings = Settings()

