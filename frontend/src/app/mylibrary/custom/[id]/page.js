"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../../../lib/firebase"
import { useAuth } from "../../../../contexts/AuthContext"
import Header from "../../../../components/Header"
import MovieCard from "../../../../components/MovieCard"
import { tmdbApi } from "../../../../lib/tmdb"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

export default function CustomListPage() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [list, setList] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      fetchList()
    }
  }, [currentUser, params.id])

  const fetchList = async () => {
    try {
      const listDoc = await getDoc(doc(db, "lists", params.id))
      if (listDoc.exists()) {
        const listData = { id: listDoc.id, ...listDoc.data() }
        setList(listData)

        if (listData.movieIds && listData.movieIds.length > 0) {
          const movieIds = listData.movieIds.filter((id) => !id.startsWith("tv_"))
          const tvIds = listData.movieIds.filter((id) => id.startsWith("tv_")).map((id) => id.replace("tv_", ""))

          let allMovies = []

          if (movieIds.length > 0) {
            const fetchedMovies = await tmdbApi.getMoviesByIds(movieIds)
            allMovies = [...allMovies, ...fetchedMovies]
          }

          if (tvIds.length > 0) {
            const fetchedTVShows = await fetchTVShowsByIds(tvIds)
            allMovies = [...allMovies, ...fetchedTVShows]
          }

          setMovies(allMovies)
        }
      }
    } catch (error) {
      console.error("Error fetching list:", error)
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Custom List</h1>
            <p className="text-gray-600">Please login to view this list.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading list...</div>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">List not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => router.push("/mylibrary")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </button>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{list.name}</h1>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">This list is empty.</p>
            <p className="text-gray-500">Start adding movies and TV shows to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <MovieCard key={`${movie.type || "movie"}_${movie.id}`} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
