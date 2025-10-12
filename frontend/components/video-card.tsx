"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, ThumbsUp, MessageCircle, CheckCircle2 } from "lucide-react"
import { VideoDetail } from "@/lib/api"
import { formatViewCount, formatDuration } from "@/lib/utils"

interface VideoCardProps {
  video: VideoDetail
}

export function VideoCard({ video }: VideoCardProps) {
  const qualityColor = 
    video.quality.quality_score >= 80 ? "text-green-600" :
    video.quality.quality_score >= 60 ? "text-yellow-600" :
    "text-gray-600"

  return (
    <Link 
      href={`/watch/${video.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail_url}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
        {video.quality.has_captions && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            CC
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
          {video.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3">
          {video.channel_name}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(video.statistics.view_count)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatViewCount(video.statistics.like_count)}
            </span>
          </div>
          
          <span className={`font-semibold ${qualityColor}`}>
            {Math.round(video.quality.quality_score)}%
          </span>
        </div>
      </div>
    </Link>
  )
}

