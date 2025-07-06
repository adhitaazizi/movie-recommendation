"use client"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { tmdbApi } from "../lib/tmdb"
import MovieCard from "./MovieCard"
import { useRouter } from "next/navigation"

export default function MediaList({
  title,
  listType,
  currentUser,
  emptyMessage = "No items found.",
  emptySubMessage = "Start adding items to see them here!",
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (currentUser) {
      fetchItems()
    } else {
      setLoading(false)
    }
  }, [currentUser, listType])

  const fetchItems = async () => {
    try {
      // Get the list for this user and type
      const listQuery = query(
        collection(db, "lists"),
        where("userId", "==", currentUser.uid),
        where("type", "==", listType),
      )
      const listSnapshot = await getDocs(listQuery)

      if (!listSnapshot.empty) {
        const listDoc = listSnapshot.docs[0]
        const listData = listDoc.data()
        const movieIds = listData.movieIds || []

        if (movieIds.length > 0) {
          const regularMovieIds = movieIds.filter((id) => !id.startsWith("tv_"))
          const tvIds = movieIds.filter((id) => id.startsWith("tv_")).map((id) => id.replace("tv_", ""))

          let allItems = []

          if (regularMovieIds.length > 0) {
            const movies = await tmdbApi.getMoviesByIds(regularMovieIds)
            allItems = [...allItems, ...movies]
          }

          if (tvIds.length > 0) {
            const tvShows = await fetchTVShowsByIds(tvIds)
            allItems = [...allItems, ...tvShows]
          }

          setItems(allItems)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${listType}:`, error)
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
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600">Please login to view your {title.toLowerCase()}.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <button onClick={() => router.push("/mylibrary")} className="text-cyan-400 hover:text-cyan-500 font-medium">
          View All Lists
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-xl">Loading your {title.toLowerCase()}...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{emptyMessage}</p>
          <p className="text-gray-500">{emptySubMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {items.map((item) => (
            <MovieCard key={`${item.type || "movie"}_${item.id}`} movie={item} />
          ))}
        </div>
      )}
    </div>
  )
}
