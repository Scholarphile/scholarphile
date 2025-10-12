"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SearchBar } from "@/components/search-bar"
import { SubjectGrid } from "@/components/subject-grid"
import { getSubjects } from "@/lib/api"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  })

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn from the best
            <span className="block text-blue-600 mt-2">educational videos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Curated, high-quality YouTube content for focused learning
          </p>
          
          <SearchBar onSearch={handleSearch} placeholder="Search for any topic..." />
          
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>Try:</span>
            {["Calculus", "Linear Algebra", "Physics", "Differential Equations"].map((topic) => (
              <button
                key={topic}
                onClick={() => handleSearch(topic)}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Subject</h2>
          {subjects && <SubjectGrid subjects={subjects} />}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Scholarphile?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Curated</h3>
              <p className="text-gray-600">
                Every video is scored and ranked by quality, engagement, and educational value
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Simple</h3>
              <p className="text-gray-600">
                Search-first interface gets you to the content you need in seconds
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Focused Learning</h3>
              <p className="text-gray-600">
                No distractions, just high-quality educational content organized for learning
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
