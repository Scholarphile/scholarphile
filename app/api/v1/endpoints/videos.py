"""Video search and curation endpoints"""

from fastapi import APIRouter, HTTPException, Query
from typing import List

from app.core.logging import get_logger
from app.schemas.video import (
    VideoSearchRequest,
    VideoSearchResponse,
    VideoCurationRequest,
    VideoCurationResponse,
    VideoDetail
)
from app.services import YouTubeService

logger = get_logger(__name__)
router = APIRouter()


@router.post("/search", response_model=VideoSearchResponse)
async def search_videos(request: VideoSearchRequest):
    """
    Search for educational videos on YouTube
    
    - **query**: Search term (e.g., "differential equations")
    - **max_results**: Number of results (1-50)
    - **order**: Sort order (relevance, date, rating, viewCount)
    - **require_captions**: Filter for videos with captions
    - **min_quality_score**: Minimum quality score filter
    """
    try:
        service = YouTubeService()
        
        videos, quota_used = service.search_videos(
            query=request.query,
            max_results=request.max_results,
            order=request.order,
            require_captions=request.require_captions
        )
        
        # Apply quality score filter if specified
        if request.min_quality_score is not None:
            videos = [v for v in videos if v.quality.quality_score >= request.min_quality_score]
        
        return VideoSearchResponse(
            query=request.query,
            total_results=len(videos),
            videos=videos,
            quota_used=quota_used
        )
        
    except Exception as e:
        logger.error("search_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/curate", response_model=VideoCurationResponse)
async def curate_videos(request: VideoCurationRequest):
    """
    Curate high-quality educational videos for a topic
    
    Returns filtered and ranked videos optimized for learning paths.
    """
    try:
        service = YouTubeService()
        
        videos, quota_used = service.curate_videos(
            topic=request.topic,
            level=request.level,
            target_duration_minutes=request.target_duration_minutes,
            max_videos=request.max_videos
        )
        
        # Calculate total duration
        total_duration = sum(
            YouTubeService.parse_duration(v.duration) for v in videos
        )
        
        # Calculate average quality score
        avg_quality = sum(v.quality.quality_score for v in videos) / len(videos) if videos else 0
        
        return VideoCurationResponse(
            topic=request.topic,
            level=request.level,
            curated_videos=videos,
            total_duration_minutes=total_duration,
            average_quality_score=round(avg_quality, 2)
        )
        
    except Exception as e:
        logger.error("curation_failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Curation failed: {str(e)}")


@router.get("/{video_id}", response_model=VideoDetail)
async def get_video_details(video_id: str):
    """
    Get detailed information for a specific YouTube video
    """
    try:
        service = YouTubeService()
        videos = service._get_video_details([video_id])
        
        if not videos:
            raise HTTPException(status_code=404, detail="Video not found")
        
        return videos[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_video_failed", video_id=video_id, error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch video: {str(e)}")

