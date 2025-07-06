"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

import { tmdbApi } from "../lib/tmdb"
import { persistentCache } from "../lib/persistentCache"
import BoldSection from "./BoldSection"

export default function TopRatedSection() {
  const [topRatedMovies, setTopRatedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopRated()
  }, [])

  const fetchTopRated = async () => {
    try {
      const cached = persistentCache.get("topRatedSection")
      if (cached) {
        setTopRatedMovies(cached)
        setLoading(false)
        return
      }

      const movies = await tmdbApi.getTopRated()
      const sliced = movies.slice(0, 15)
      setTopRatedMovies(sliced)
      persistentCache.set("topRatedSection", sliced)
    } catch (error) {
      console.error("Error fetching top rated movies:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <div className="text-lg">Loading top rated movies...</div>
          </div>
        </div>
      </section>
    )
  }

  const TopRatedMovieCard = ({ item }) => (
    <div className="relative group cursor-pointer">
      <Link href={`/movie/${item.id}`}>
        <div className="relative">
          <img
            src={item.poster || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-72 object-cover rounded-lg"
          />
          {/* Rating Badge */}
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-black bg-opacity-80 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{item.rating}%</span>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
          <p className="text-gray-600 text-xs">{item.releaseDate}</p>
        </div>
      </Link>
    </div>
  )

  return <BoldSection title="Top Rated Movies" items={topRatedMovies} ItemComponent={TopRatedMovieCard} />
}
