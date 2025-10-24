import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Types matching backend schemas
export interface VideoStatistics {
  view_count: number
  like_count: number
  comment_count: number
}

export interface VideoQuality {
  has_captions: boolean
  quality_score: number
  engagement_rate: number
}

export interface VideoDetail {
  id: string
  title: string
  description: string
  channel_name: string
  channel_id: string
  thumbnail_url: string
  duration: string
  published_at: string
  statistics: VideoStatistics
  quality: VideoQuality
  url: string
}

export interface VideoSearchRequest {
  query: string
  max_results?: number
  order?: "relevance" | "date" | "rating" | "viewCount"
  require_captions?: boolean
  min_quality_score?: number
  duration?: "any" | "short" | "medium" | "long"
  page_token?: string
}

export interface VideoSearchResponse {
  query: string
  total_results: number
  videos: VideoDetail[]
  quota_used: number
  next_page_token?: string
}

export interface VideoCurationRequest {
  topic: string
  level?: "intro" | "intermediate" | "advanced"
  target_duration_minutes?: number
  max_videos?: number
}

export interface VideoCurationResponse {
  topic: string
  level: string
  curated_videos: VideoDetail[]
  total_duration_minutes: number
  average_quality_score: number
}

export interface Subject {
  id: string
  slug: string
  title: string
  description?: string
  icon?: string
}

export interface Course {
  id: string
  subject_id: string
  slug: string
  title: string
  description?: string
  level?: string
}

// API Functions
export const searchVideos = async (
  request: VideoSearchRequest
): Promise<VideoSearchResponse> => {
  const { data } = await api.post<VideoSearchResponse>("/videos/search", request)
  return data
}

export const curateVideos = async (
  request: VideoCurationRequest
): Promise<VideoCurationResponse> => {
  const { data } = await api.post<VideoCurationResponse>("/videos/curate", request)
  return data
}

export const getVideoDetails = async (videoId: string): Promise<VideoDetail> => {
  const { data } = await api.get<VideoDetail>(`/videos/${videoId}`)
  return data
}

export const getSubjects = async (): Promise<Subject[]> => {
  const { data } = await api.get<Subject[]>("/content/subjects")
  return data
}

export const getCourses = async (subjectSlug: string): Promise<Course[]> => {
  const { data } = await api.get<Course[]>(`/content/subjects/${subjectSlug}/courses`)
  return data
}

export const healthCheck = async (): Promise<{ status: string }> => {
  const { data } = await api.get("/health")
  return data
}

