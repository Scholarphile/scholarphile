"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { VideoGrid } from "@/components/video-grid"
import { curateVideos, VideoCurationRequest } from "@/lib/api"
import { Sparkles } from "lucide-react"

export default function CuratePage() {
  const [request, setRequest] = useState<VideoCurationRequest>({
    topic: "",
    level: "intermediate",
    max_videos: 5,
  })

  const mutation = useMutation({
    mutationFn: curateVideos,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (request.topic.trim()) {
      mutation.mutate(request)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Curate Learning Path
        </h1>
        <p className="text-gray-600">
          Get AI-curated, high-quality videos optimized for learning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={request.topic}
              onChange={(e) => setRequest({ ...request, topic: e.target.value })}
              placeholder="e.g., Differential Equations"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={request.level}
              onChange={(e) => setRequest({ ...request, level: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="intro">Introduction / Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Videos
            </label>
            <select
              value={request.max_videos}
              onChange={(e) => setRequest({ ...request, max_videos: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>3 videos</option>
              <option value={5}>5 videos</option>
              <option value={10}>10 videos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Duration (minutes)
            </label>
            <input
              type="number"
              value={request.target_duration_minutes || ""}
              onChange={(e) => setRequest({ 
                ...request, 
                target_duration_minutes: e.target.value ? Number(e.target.value) : undefined 
              })}
              placeholder="Optional"
              min="5"
              max="180"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              Curating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Curate Videos
            </>
          )}
        </button>
      </form>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to curate videos. Please try again.</p>
        </div>
      )}

      {mutation.data && (
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Curation Summary</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Duration:</span>
                <span className="font-semibold ml-2">{mutation.data.total_duration_minutes} min</span>
              </div>
              <div>
                <span className="text-blue-700">Average Quality:</span>
                <span className="font-semibold ml-2">{mutation.data.average_quality_score}%</span>
              </div>
              <div>
                <span className="text-blue-700">Videos Found:</span>
                <span className="font-semibold ml-2">{mutation.data.curated_videos.length}</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Curated Videos</h2>
          <VideoGrid videos={mutation.data.curated_videos} />
        </div>
      )}
    </div>
  )
}

