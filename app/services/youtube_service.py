"""Production YouTube integration service"""

import re
from datetime import datetime
from typing import List, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core import settings
from app.core.logging import get_logger
from app.schemas.video import (
    VideoDetail,
    VideoStatistics,
    VideoQuality
)

logger = get_logger(__name__)


class YouTubeService:
    """Production service for YouTube video curation"""
    
    def __init__(self):
        self.api_key = settings.youtube_api_key
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        self.quota_used = 0
        
    def search_videos(
        self,
        query: str,
        max_results: int = 10,
        order: str = 'relevance',
        require_captions: bool = False
    ) -> tuple[List[VideoDetail], int]:
        """
        Search for educational videos
        
        Returns:
            Tuple of (videos, quota_used)
        """
        try:
            logger.info("searching_videos", query=query, max_results=max_results, order=order)
            
            # Search for videos (100 quota units)
            request = self.youtube.search().list(
                q=query,
                part='snippet',
                type='video',
                maxResults=max_results,
                order=order,
                videoCategoryId='27',  # Education category
                videoCaption='closedCaption' if require_captions else 'any'
            )
            
            response = request.execute()
            quota_used = 100
            
            # Extract video IDs
            video_ids = [item['id']['videoId'] for item in response['items']]
            
            if not video_ids:
                return [], quota_used
            
            # Get detailed video information (1 quota unit per call)
            videos = self._get_video_details(video_ids)
            quota_used += 1
            
            logger.info("search_complete", found=len(videos), quota=quota_used)
            
            return videos, quota_used
            
        except HttpError as e:
            logger.error("youtube_api_error", error=str(e), status=e.status_code)
            raise
        except Exception as e:
            logger.error("search_error", error=str(e))
            raise
    
    def _get_video_details(self, video_ids: List[str]) -> List[VideoDetail]:
        """Get detailed information for videos"""
        try:
            ids_string = ','.join(video_ids)
            
            request = self.youtube.videos().list(
                part='snippet,contentDetails,statistics',
                id=ids_string
            )
            
            response = request.execute()
            
            videos = []
            for item in response['items']:
                try:
                    video = self._parse_video_item(item)
                    videos.append(video)
                except Exception as e:
                    logger.warning("failed_to_parse_video", video_id=item.get('id'), error=str(e))
                    continue
            
            return videos
            
        except HttpError as e:
            logger.error("failed_to_get_video_details", error=str(e))
            return []
    
    def _parse_video_item(self, item: dict) -> VideoDetail:
        """Parse YouTube API response into VideoDetail"""
        snippet = item['snippet']
        statistics = item.get('statistics', {})
        content_details = item.get('contentDetails', {})
        
        # Parse statistics
        view_count = int(statistics.get('viewCount', 0))
        like_count = int(statistics.get('likeCount', 0))
        comment_count = int(statistics.get('commentCount', 0))
        
        video_stats = VideoStatistics(
            view_count=view_count,
            like_count=like_count,
            comment_count=comment_count
        )
        
        # Calculate quality metrics
        has_captions = content_details.get('caption', 'false') == 'true'
        engagement_rate = (like_count / view_count * 100) if view_count > 0 else 0
        quality_score = self._calculate_quality_score(
            view_count, like_count, comment_count, has_captions, engagement_rate
        )
        
        video_quality = VideoQuality(
            has_captions=has_captions,
            quality_score=quality_score,
            engagement_rate=engagement_rate
        )
        
        # Parse published date
        published_at = datetime.fromisoformat(snippet['publishedAt'].replace('Z', '+00:00'))
        
        return VideoDetail(
            id=item['id'],
            title=snippet['title'],
            description=snippet['description'],
            channel_name=snippet['channelTitle'],
            channel_id=snippet['channelId'],
            thumbnail_url=snippet['thumbnails']['high']['url'],
            duration=content_details.get('duration', 'PT0S'),
            published_at=published_at,
            statistics=video_stats,
            quality=video_quality,
            url=f"https://www.youtube.com/watch?v={item['id']}"
        )
    
    def _calculate_quality_score(
        self,
        views: int,
        likes: int,
        comments: int,
        has_captions: bool,
        engagement_rate: float
    ) -> float:
        """Calculate video quality score (0-100)"""
        score = 0.0
        
        # View count score (max 30 points)
        if views >= 100000:
            score += 30
        elif views >= 10000:
            score += 20
        elif views >= 1000:
            score += 10
        else:
            score += 5
        
        # Engagement rate score (max 30 points)
        if engagement_rate >= 5:
            score += 30
        elif engagement_rate >= 2:
            score += 20
        elif engagement_rate >= 1:
            score += 10
        else:
            score += 5
        
        # Comment engagement score (max 20 points)
        if comments >= 1000:
            score += 20
        elif comments >= 100:
            score += 15
        elif comments >= 10:
            score += 10
        else:
            score += 5
        
        # Captions availability (20 points)
        if has_captions:
            score += 20
        
        return min(score, 100.0)
    
    def curate_videos(
        self,
        topic: str,
        level: str = "intermediate",
        target_duration_minutes: Optional[int] = None,
        max_videos: int = 5
    ) -> tuple[List[VideoDetail], int]:
        """
        Curate high-quality videos for a topic
        
        Returns:
            Tuple of (curated_videos, quota_used)
        """
        # Build search query based on level
        level_keywords = {
            "intro": "introduction tutorial beginner",
            "intermediate": "tutorial explained",
            "advanced": "advanced deep dive"
        }
        
        query = f"{topic} {level_keywords.get(level, 'tutorial')}"
        
        # Search for more videos than needed to allow filtering
        videos, quota_used = self.search_videos(
            query=query,
            max_results=max_videos * 3,
            order='rating',
            require_captions=True
        )
        
        # Sort by quality score
        videos.sort(key=lambda v: v.quality.quality_score, reverse=True)
        
        # Take top N videos
        curated = videos[:max_videos]
        
        logger.info("videos_curated", topic=topic, level=level, count=len(curated))
        
        return curated, quota_used
    
    @staticmethod
    def parse_duration(duration_iso: str) -> int:
        """Parse ISO 8601 duration to minutes"""
        # PT1H30M45S -> 90 minutes
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_iso)
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 60 + minutes + (1 if seconds > 30 else 0)

