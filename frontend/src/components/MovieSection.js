"use client"
import { useState, useRef } from "react"
import MovieCard from "./MovieCard"
import Link from "next/link"

export default function MovieSection({ title, movies, tabs, linkTo, showEmpty = false, emptyMessage }) {
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0] : null)
  const scrollRef = useRef(null)

  const handleScroll = () => {
    // Simple scroll handling for progress bar
  }

  // Show empty state if no movies and showEmpty is true
  if (showEmpty && (!movies || movies.length === 0)) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{emptyMessage || "No items found."}</p>
          </div>
        </div>
      </section>
    )
  }

  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            {linkTo ? (
              <Link href={linkTo}>
                <h2 className="text-2xl font-bold hover:text-cyan-400 cursor-pointer">{title}</h2>
              </Link>
            ) : (
              <h2 className="text-2xl font-bold">{title}</h2>
            )}
            {tabs && (
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab ? "bg-slate-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Horizontal scrolling container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-48">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Simple gray slide bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-gray-400 h-1 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
