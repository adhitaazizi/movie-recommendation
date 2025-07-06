"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <section className="relative h-80 bg-gradient-to-r from-blue-900 via-blue-700 to-teal-500 overflow-hidden">
      {/* Background pattern/texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-teal-400 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-blue-300 rounded-full opacity-25"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-2 h-full flex flex-col justify-center">
        <div className="max-w-4xl text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome.</h1>
          <p className="text-xl mb-8">Millions of movies, TV shows and people to discover. Explore now.</p>

          <form onSubmit={handleSearch} className="flex max-w-4xl">
            <input
              type="text"
              placeholder="Search for a movie, tv show, person......"
              className="flex-1 px-6 py-4 rounded-l-full text-gray-800 text-lg bg-white placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 px-8 py-4 rounded-r-full text-white font-semibold transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
