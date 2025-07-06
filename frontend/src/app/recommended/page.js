"use client"
import { useState, useEffect } from "react"
import Header from "../../components/Header"
import MovieCard from "../../components/MovieCard"
import { tmdbApi } from "../../lib/tmdb"

export default function RecommendedPage() {
  const [recommendedMovies, setRecommendedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommended()
  }, [])

  const fetchRecommended = async () => {
    try {
      // Fetch from recommendation API
      const userId = "anonymous" // You can get this from auth context if needed
      const response = await fetch(`/api/recommendations?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      const data = await response.json()
      const movies = await tmdbApi.getMoviesByIds(data.movieIds)
      setRecommendedMovies(movies)
    } catch (error) {
      console.error("Error fetching recommended movies:", error)
      // Fallback to TMDB recommended
      const fallback = await tmdbApi.getRecommended()
      setRecommendedMovies(fallback)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-xl">Loading recommendations...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Recommended for you</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {recommendedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  )
}
