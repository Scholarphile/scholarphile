"""Health check endpoints"""

from fastapi import APIRouter
from app.core import settings

router = APIRouter()


@router.get("")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": settings.version,
        "service": settings.project_name,
        "environment": "development" if settings.debug else "production"
    }

