"use client"

import Link from "next/link"
import { Subject } from "@/lib/api"

interface SubjectGridProps {
  subjects: Subject[]
}

export function SubjectGrid({ subjects }: SubjectGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {subjects.map((subject) => (
        <Link
          key={subject.id}
          href={`/search?topic=${encodeURIComponent(subject.title)}`}
          className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-blue-500"
        >
          <div className="text-4xl mb-3">{subject.icon || "📚"}</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {subject.title}
          </h3>
          {subject.description && (
            <p className="text-sm text-gray-600 mt-1">{subject.description}</p>
          )}
        </Link>
      ))}
    </div>
  )
}

