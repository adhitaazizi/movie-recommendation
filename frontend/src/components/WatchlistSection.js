"use client"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuth } from "../contexts/AuthContext"
import { tmdbApi } from "../lib/tmdb"
import BoldSection from "./BoldSection"
import WatchlistCard from "./WatchlistCard"

export default function WatchlistSection() {
  const { currentUser } = useAuth()
  const [watchlistMovies, setWatchlistMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      fetchWatchlist()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const fetchWatchlist = async () => {
    try {
      // Get the watchlist for this user
      const listQuery = query(
        collection(db, "lists"),
        where("userId", "==", currentUser.uid),
        where("type", "==", "watchlist"),
      )
      const listSnapshot = await getDocs(listQuery)

      if (!listSnapshot.empty) {
        const listDoc = listSnapshot.docs[0]
        const listData = listDoc.data()
        const movieIds = listData.movieIds || []

        if (movieIds.length > 0) {
          const regularMovieIds = movieIds.filter((id) => !id.startsWith("tv_")).slice(0, 4)
          const tvIds = movieIds
            .filter((id) => id.startsWith("tv_"))
            .map((id) => id.replace("tv_", ""))
            .slice(0, 4)

          let allItems = []

          if (regularMovieIds.length > 0) {
            const movies = await tmdbApi.getMoviesByIds(regularMovieIds)
            allItems = [...allItems, ...movies]
          }

          if (tvIds.length > 0) {
            const tvShows = await fetchTVShowsByIds(tvIds)
            allItems = [...allItems, ...tvShows]
          }

          setWatchlistMovies(allItems.slice(0, 4))
        }
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTVShowsByIds = async (tvIds) => {
    if (!tvIds || tvIds.length === 0) return []

    const tvPromises = tvIds.map(async (id) => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        )
        if (!response.ok) return null

        const tv = await response.json()
        return {
          id: tv.id,
          title: tv.name,
          releaseDate: tv.first_air_date
            ? new Date(tv.first_air_date).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "TBA",
          rating: Math.round(tv.vote_average * 10),
          poster: tv.poster_path
            ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
            : "/placeholder.svg?height=300&width=200",
          type: "tv",
        }
      } catch (error) {
        console.error(`Error fetching TV show ${id}:`, error)
        return null
      }
    })

    const tvShows = await Promise.all(tvPromises)
    return tvShows.filter((show) => show !== null)
  }

  if (!currentUser) {
    return null
  }

  if (loading) {
    return (
      <section className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-2">
          <div className="text-center py-8">
            <div className="text-lg">Loading watchlist...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-2">
        <BoldSection
          title="My Watchlist"
          items={watchlistMovies}
          linkTo="/mylibrary/watchlist"
          showEmpty={watchlistMovies.length === 0}
          emptyMessage="You have no watchlist added"
          ItemComponent={WatchlistCard}
        />
      </div>
    </section>
  )
}
