"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useInfiniteQuery } from "@tanstack/react-query"
import { SearchBar } from "@/components/search-bar"
import { VideoGrid } from "@/components/video-grid"
import { searchVideos } from "@/lib/api"
import { Filter, SlidersHorizontal } from "lucide-react"

export const dynamic = 'force-dynamic'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  
  const [filters, setFilters] = useState({
    order: "relevance" as "relevance" | "date" | "rating" | "viewCount",
    requireCaptions: false,
    minQualityScore: undefined as number | undefined,
    duration: "any" as "any" | "short" | "medium" | "long",
  })
  
  const [showFilters, setShowFilters] = useState(false)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["search", query, filters],
    queryFn: ({ pageParam }) =>
      searchVideos({
        query,
        max_results: 12,
        order: filters.order,
        require_captions: filters.requireCaptions,
        min_quality_score: filters.minQualityScore,
        duration: filters.duration,
        page_token: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.next_page_token ?? undefined,
    enabled: !!query,
  })

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams()
    params.set("q", newQuery)
    // Persist filters in URL for sharable searches
    params.set("order", filters.order)
    if (filters.requireCaptions) params.set("captions", "1")
    if (filters.minQualityScore) params.set("minq", String(filters.minQualityScore))
    if (filters.duration && filters.duration !== "any") params.set("dur", filters.duration)
    router.push(`/search?${params.toString()}`)
  }

  // On first load, hydrate filters from URL
  useEffect(() => {
    const order = (searchParams.get("order") as any) || "relevance"
    const captions = searchParams.get("captions") === "1"
    const minq = searchParams.get("minq")
    const dur = (searchParams.get("dur") as any) || "any"
    setFilters({
      order,
      requireCaptions: captions,
      minQualityScore: minq ? Number(minq) : undefined,
      duration: dur,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} initialQuery={query} />
      </div>

      {query && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Search Results
              {data && (
                <span className="text-gray-500 font-normal ml-2">
                  ({(data.pages?.[0]?.total_results ?? 0)} videos)
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">for "{query}"</p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Filter Results</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.order}
                onChange={(e) => setFilters({ ...filters, order: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="viewCount">View Count</option>
                <option value="date">Upload Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Quality Score
              </label>
              <select
                value={filters.minQualityScore || ""}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  minQualityScore: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="80">Excellent (80+)</option>
                <option value="60">Good (60+)</option>
                <option value="40">Fair (40+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="any">Any</option>
                <option value="short">Short (&lt; 4m)</option>
                <option value="medium">Medium (4–20m)</option>
                <option value="long">Long (&gt; 20m)</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.requireCaptions}
                  onChange={(e) => setFilters({ ...filters, requireCaptions: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Captions Required
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to load videos. Please try again.</p>
        </div>
      )}

      <VideoGrid
        videos={(data?.pages || []).flatMap((p) => p.videos) || []}
        loading={isLoading && !(data?.pages?.length)}
      />

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {data?.pages?.[0]?.quota_used && (
        <p className="text-center text-sm text-gray-500 mt-8">
          API quota used: {data.pages[0].quota_used} units
        </p>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

