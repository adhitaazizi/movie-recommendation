"use client"
import { useState, useEffect } from "react"
import Header from "../components/Header"
import HeroSection from "../components/HeroSection"
import MovieSection from "../components/MovieSection"
import WatchlistSection from "../components/WatchlistSection"
import TopRatedSection from "../components/TopRatedSection"
import Chatbot from "../components/Chatbot"
import Footer from "../components/Footer"
import { tmdbApi } from "../lib/tmdb"
import { persistentCache } from "../lib/persistentCache"
import { useAuth } from "../contexts/AuthContext"

export default function Home() {
  const { currentUser } = useAuth()
  const [trendingMovies, setTrendingMovies] = useState([])
  const [recommendedMovies, setRecommendedMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [tvShows, setTvShows] = useState([])
  const [recommendedTVShows, setRecommendedTVShows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [currentUser])

  const fetchRecommendedMovies = async () => {
    try {
      // Fetch from recommendation API
      const userId = currentUser?.uid || "anonymous"
      const response = await fetch(`/api/recommendations?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      const data = await response.json()
      const movies = await tmdbApi.getMoviesByIds(data.movieIds.slice(0, 15))
      return movies
    } catch (error) {
      console.error("Error fetching recommended movies:", error)
      // Fallback to top rated movies
      const fallback = await tmdbApi.getRecommended()
      return fallback
    }
  }

  const fetchAllData = async () => {
    try {
      // Check persistent cache for trending, popular, and TV shows
      const cachedTrending = persistentCache.get("trending")
      const cachedPopular = persistentCache.get("popular")
      const cachedTVShows = persistentCache.get("tvShows")
      const cachedRecommendedTV = persistentCache.get("recommendedTVShows")

      let trendingPromise, popularPromise, tvShowsPromise, recommendedTVPromise

      if (cachedTrending) {
        trendingPromise = Promise.resolve(cachedTrending)
      } else {
        trendingPromise = tmdbApi.getTrending().then((movies) => {
          const sliced = movies.slice(0, 15)
          persistentCache.set("trending", sliced)
          return sliced
        })
      }

      if (cachedPopular) {
        popularPromise = Promise.resolve(cachedPopular)
      } else {
        popularPromise = tmdbApi.getPopular().then((movies) => {
          const sliced = movies.slice(0, 15)
          persistentCache.set("popular", sliced)
          return sliced
        })
      }

      if (cachedTVShows) {
        tvShowsPromise = Promise.resolve(cachedTVShows)
      } else {
        tvShowsPromise = tmdbApi.getTVShows().then((shows) => {
          const sliced = shows.slice(0, 15)
          persistentCache.set("tvShows", sliced)
          return sliced
        })
      }

      if (cachedRecommendedTV) {
        recommendedTVPromise = Promise.resolve(cachedRecommendedTV)
      } else {
        recommendedTVPromise = tmdbApi.getRecommendedTVShows().then((shows) => {
          const sliced = shows.slice(0, 15)
          persistentCache.set("recommendedTVShows", sliced)
          return sliced
        })
      }

      const [trending, recommended, popular, tvShowsData, recommendedTVData] = await Promise.all([
        trendingPromise,
        fetchRecommendedMovies(),
        popularPromise,
        tvShowsPromise,
        recommendedTVPromise,
      ])

      setTrendingMovies(trending)
      setRecommendedMovies(recommended)
      setPopularMovies(popular)
      setTvShows(tvShowsData)
      setRecommendedTVShows(recommendedTVData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading movies...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />

      <MovieSection title="Trending" movies={trendingMovies} tabs={["Today", "This Week"]} />

      <WatchlistSection />

      <MovieSection title="TV Shows" movies={tvShows} />

      <MovieSection title="Recommended for you" movies={recommendedMovies} linkTo="/recommended" />

      <TopRatedSection />

      <MovieSection title="Recommended TV Shows" movies={recommendedTVShows} />

      <MovieSection
        title="Popular Movies"
        movies={popularMovies}
        tabs={["Streaming", "On TV", "For Rent", "In Theaters"]}
      />

      <Footer />
      <Chatbot />
    </div>
  )
}
