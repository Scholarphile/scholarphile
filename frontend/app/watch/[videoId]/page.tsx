"use client"

export const dynamic = 'force-dynamic'

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { getVideoDetails } from "@/lib/api"
import { formatViewCount, formatDuration } from "@/lib/utils"
import { Eye, ThumbsUp, MessageCircle, ExternalLink, CheckCircle2 } from "lucide-react"

// Dynamically import YouTube player to avoid SSR issues
const YouTube = dynamic(() => import("react-youtube"), { ssr: false })

export default function WatchPage() {
  const params = useParams()
  const videoId = params.videoId as string

  const { data: video, isLoading, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => getVideoDetails(videoId),
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg mb-6" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Failed to load video. Please try again.</p>
        </div>
      </div>
    )
  }

  const qualityColor = 
    video.quality.quality_score >= 80 ? "text-green-600" :
    video.quality.quality_score >= 60 ? "text-yellow-600" :
    "text-gray-600"

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Video Section */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
            <YouTube
              videoId={videoId}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
                  rel: 0,
                },
              }}
              className="w-full h-full"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {video.title}
          </h1>

          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-lg font-semibold text-gray-900">{video.channel_name}</p>
              <p className="text-sm text-gray-600">
                {new Date(video.published_at).toLocaleDateString()}
              </p>
            </div>

            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Watch on YouTube
            </a>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {video.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Video Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="h-5 w-5" />
                  <span>Views</span>
                </div>
                <span className="font-semibold">
                  {formatViewCount(video.statistics.view_count)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <ThumbsUp className="h-5 w-5" />
                  <span>Likes</span>
                </div>
                <span className="font-semibold">
                  {formatViewCount(video.statistics.like_count)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="h-5 w-5" />
                  <span>Comments</span>
                </div>
                <span className="font-semibold">
                  {formatViewCount(video.statistics.comment_count)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{formatDuration(video.duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Captions</span>
                {video.quality.has_captions ? (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Available
                  </span>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </div>
            </div>
          </div>

          {/* Quality Score Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quality Score</h3>
            <div className="text-center">
              <div className={`text-5xl font-bold ${qualityColor} mb-2`}>
                {Math.round(video.quality.quality_score)}
              </div>
              <div className="text-gray-600 mb-4">out of 100</div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all ${
                    video.quality.quality_score >= 80 ? "bg-green-600" :
                    video.quality.quality_score >= 60 ? "bg-yellow-600" :
                    "bg-gray-600"
                  }`}
                  style={{ width: `${video.quality.quality_score}%` }}
                />
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  Engagement Rate: <span className="font-semibold">
                    {video.quality.engagement_rate.toFixed(2)}%
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Based on views, likes, comments, and captions availability
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

