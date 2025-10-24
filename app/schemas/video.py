"""Video-related schemas"""

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, HttpUrl


class VideoBase(BaseModel):
    """Base video information"""
    id: str = Field(..., description="YouTube video ID")
    title: str
    description: str
    channel_name: str
    channel_id: str
    thumbnail_url: HttpUrl
    duration: str
    published_at: datetime


class VideoStatistics(BaseModel):
    """Video engagement statistics"""
    view_count: int = Field(ge=0)
    like_count: int = Field(ge=0)
    comment_count: int = Field(ge=0)


class VideoQuality(BaseModel):
    """Video quality metrics"""
    has_captions: bool
    quality_score: float = Field(ge=0, le=100, description="Quality score 0-100")
    engagement_rate: float = Field(ge=0, description="Likes per view ratio")
    

class VideoDetail(VideoBase):
    """Detailed video information"""
    statistics: VideoStatistics
    quality: VideoQuality
    url: str
    
    @property
    def youtube_url(self) -> str:
        return f"https://www.youtube.com/watch?v={self.id}"


class VideoSearchRequest(BaseModel):
    """Video search request"""
    query: str = Field(..., min_length=1, max_length=200, description="Search query")
    max_results: int = Field(default=10, ge=1, le=50, description="Max results to return")
    order: str = Field(default="relevance", description="Sort order: relevance, date, rating, viewCount")
    require_captions: bool = Field(default=False, description="Filter for videos with captions")
    min_quality_score: Optional[float] = Field(default=None, ge=0, le=100, description="Minimum quality score")
    duration: Literal["any", "short", "medium", "long"] = Field(
        default="any",
        description="Filter by duration category: short(<4m), medium(4-20m), long(>20m)",
    )
    page_token: Optional[str] = Field(default=None, description="YouTube API page token for pagination")


class VideoSearchResponse(BaseModel):
    """Video search response"""
    query: str
    total_results: int
    videos: List[VideoDetail]
    quota_used: int = Field(..., description="YouTube API quota units used")
    next_page_token: Optional[str] = Field(default=None, description="Token to fetch the next page of results")


class VideoCurationRequest(BaseModel):
    """Request to curate videos for a learning path"""
    topic: str = Field(..., description="Topic or subject area")
    level: str = Field(default="intermediate", description="Difficulty level: intro, intermediate, advanced")
    target_duration_minutes: Optional[int] = Field(default=None, ge=5, le=180, description="Target video duration")
    max_videos: int = Field(default=5, ge=1, le=20)


class VideoCurationResponse(BaseModel):
    """Curated video collection response"""
    topic: str
    level: str
    curated_videos: List[VideoDetail]
    total_duration_minutes: int
    average_quality_score: float

