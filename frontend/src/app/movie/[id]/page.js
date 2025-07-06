"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, addDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import MovieCard from "@/components/MovieCard"
import TrailerModal from "@/components/TrailerModal"
import { Heart, Bookmark, Play, ArrowLeft, List } from "lucide-react"
import { tmdbApi } from "@/lib/tmdb"
import RatingComponent from "@/components/RatingComponent"

export default function MovieDetails() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [movie, setMovie] = useState(null)
  const [relatedMovies, setRelatedMovies] = useState([])
  const [trailers, setTrailers] = useState([])
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)

  const fetchRelatedMovies = async () => {
    try {
      const response = await fetch(`/api/recommendations?movieId=${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch related movies")
      const data = await response.json()
      const movies = await tmdbApi.getMoviesByIds(data.movieIds.slice(0, 6))
      return movies
    } catch (error) {
      console.error("Error fetching related movies:", error)
      const fallback = await tmdbApi.getRecommended()
      return fallback.slice(0, 6)
    }
  }

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieData = await tmdbApi.getMovieDetails(params.id)
        setMovie(movieData)

        const videoData = await tmdbApi.getVideos(params.id)
        setTrailers(videoData)

        const related = await fetchRelatedMovies()
        setRelatedMovies(related)

        if (currentUser) {
          await checkWatchlistStatus()
          await fetchUserRating()
        }
      } catch (error) {
        console.error("Error fetching movie:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [params.id, currentUser])

  const toggleWatchlist = async () => {
    if (!currentUser) {
      alert("Please login to add to watchlist")
      return
    }

    try {
      // Get or create watchlist
      const listQuery = query(
        collection(db, "lists"),
        where("userId", "==", currentUser.uid),
        where("type", "==", "watchlist"),
      )
      const listSnapshot = await getDocs(listQuery)

      let listDoc
      if (listSnapshot.empty) {
        // Create watchlist
        const newListRef = await addDoc(collection(db, "lists"), {
          userId: currentUser.uid,
          name: "Watchlist",
          type: "watchlist",
          movieIds: [],
          createdAt: new Date(),
          isDefault: true,
        })
        listDoc = { id: newListRef.id, movieIds: [] }
      } else {
        listDoc = { id: listSnapshot.docs[0].id, ...listSnapshot.docs[0].data() }
      }

      const movieIds = listDoc.movieIds || []
      const movieIdToToggle = `movie_${params.id}`

      if (isInWatchlist) {
        // Remove from watchlist
        const updatedIds = movieIds.filter((id) => id !== movieIdToToggle)
        await updateDoc(doc(db, "lists", listDoc.id), { movieIds: updatedIds })
        setIsInWatchlist(false)
      } else {
        // Add to watchlist
        const updatedIds = [...movieIds, movieIdToToggle]
        await updateDoc(doc(db, "lists", listDoc.id), { movieIds: updatedIds })
        setIsInWatchlist(true)
      }
    } catch (error) {
      console.error("Error updating watchlist:", error)
    }
  }

  const toggleWatched = async () => {
    if (!currentUser) {
      alert("Please login to mark as watched")
      return
    }

    try {
      // Get or create watched list
      const listQuery = query(
        collection(db, "lists"),
        where("userId", "==", currentUser.uid),
        where("type", "==", "watched"),
      )
      const listSnapshot = await getDocs(listQuery)

      let listDoc
      if (listSnapshot.empty) {
        // Create watched list
        const newListRef = await addDoc(collection(db, "lists"), {
          userId: currentUser.uid,
          name: "Watched",
          type: "watched",
          movieIds: [],
          createdAt: new Date(),
          isDefault: true,
        })
        listDoc = { id: newListRef.id, movieIds: [] }
      } else {
        listDoc = { id: listSnapshot.docs[0].id, ...listSnapshot.docs[0].data() }
      }

      const movieIds = listDoc.movieIds || []
      const movieIdToToggle = `movie_${params.id}`

      if (isWatched) {
        // Remove from watched
        const updatedIds = movieIds.filter((id) => id !== movieIdToToggle)
        await updateDoc(doc(db, "lists", listDoc.id), { movieIds: updatedIds })
        setIsWatched(false)
      } else {
        // Add to watched
        const updatedIds = [...movieIds, movieIdToToggle]
        await updateDoc(doc(db, "lists", listDoc.id), { movieIds: updatedIds })
        setIsWatched(true)
      }
    } catch (error) {
      console.error("Error updating watched status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!currentUser) {
      alert("Please login to add to favorites")
      return
    }

    try {
      // Get or create favorites list
      const listQuery = query(
        collection(db, "lists"),
        where("userId", "==", currentUser.uid),
        where("type", "==", "favorites"),
      )
      const listSnapshot = await getDocs(listQuery)

      let listDoc
      if (listSnapshot.empty) {
        // Create favorites list
        const newListRef = await addDoc(collection(db, "lists"), {
          userId: currentUser.uid,
          name: "Favorites",
          type: "favorites",
          movieIds: [],
          createdAt: new Date(),
          isDefault: true,
        })
        listDoc = { id: newListRef.id, movieIds: [] }
      } else {
        listDoc = { id: listSnapshot.docs[0].id, ...listSnapshot.docs[0].data() }
      }

      const movieIds = listDoc.movieIds || []
      const movieIdToToggle = `movie_${params.id}`

      if (isFavorite) {
        // Remove from favorites
        const updatedIds = movieIds.filter((id) => id !== movieIdToToggle)
        await updateDoc(doc(db, "lists", listDoc.id), { movieIds: updatedIds })
        setIsFavorite(false)
      } else {
        // Add to favorites
        const updatedIds = [...movieIds, movieIdToToggle]
        await updateDoc(doc(db, "lists", listDoc.id), { movieIds: updatedIds })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Error updating favorites:", error)
    }
  }

  const checkWatchlistStatus = async () => {
    if (!currentUser) return

    try {
      const listTypes = ["watchlist", "watched", "favorites"]
      const movieIdToCheck = `movie_${params.id}`

      for (const listType of listTypes) {
        const listQuery = query(
          collection(db, "lists"),
          where("userId", "==", currentUser.uid),
          where("type", "==", listType),
        )
        const listSnapshot = await getDocs(listQuery)

        if (!listSnapshot.empty) {
          const listData = listSnapshot.docs[0].data()
          const movieIds = listData.movieIds || []

          if (listType === "watchlist") {
            setIsInWatchlist(movieIds.includes(movieIdToCheck))
          } else if (listType === "watched") {
            setIsWatched(movieIds.includes(movieIdToCheck))
          } else if (listType === "favorites") {
            setIsFavorite(movieIds.includes(movieIdToCheck))
          }
        }
      }
    } catch (error) {
      console.error("Error checking status:", error)
    }
  }

  const fetchUserRating = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/ratings?userId=${currentUser.uid}&itemId=movie_${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserRating(data.rating || 0)
      }
    } catch (error) {
      console.error("Error fetching user rating:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Movie not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Section with Transparent Background */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={movie.backdrop || "/placeholder.svg?height=400&width=800"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-75"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img
                src={movie.poster || "/placeholder.svg?height=600&width=400"}
                alt={movie.title}
                className="w-80 h-auto object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Movie Info */}
            <div className="text-white flex-1">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="text-lg mb-4 opacity-90">
                {movie.releaseDate} • {movie.genres.join(", ")} • {movie.runtime}m
              </div>

              {movie.tagline && <p className="text-xl italic mb-6 opacity-80">{movie.tagline}</p>}

              {/* Rating and Actions */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full border-4 border-green-400">
                  <span className="text-lg font-bold text-green-400">{Math.round(movie.rating * 10)}%</span>
                </div>
                <span className="text-lg font-semibold">User Score</span>

                <div className="flex items-center space-x-4">
                  <button className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors">
                    <List className="w-6 h-6" />
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? "fill-current text-red-400" : ""}`} />
                  </button>
                  <button
                    onClick={toggleWatchlist}
                    className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Bookmark className={`w-6 h-6 ${isInWatchlist ? "fill-current text-yellow-400" : ""}`} />
                  </button>
                </div>

                {trailers.length > 0 && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Play Trailer</span>
                  </button>
                )}
              </div>

              {/* User Rating */}
              {currentUser && (
                <div className="mb-8">
                  <RatingComponent
                    itemId={`movie_${params.id}`}
                    userId={currentUser.uid}
                    initialRating={userRating}
                    onRatingChange={setUserRating}
                  />
                </div>
              )}

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-lg leading-relaxed opacity-90">{movie.overview}</p>
              </div>

              {/* Cast and Crew Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {movie.crew.map((person) => (
                  <div
                    key={person.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/person/${person.id}`)}
                  >
                    <h3 className="text-lg font-semibold">{person.name}</h3>
                    <p className="text-sm opacity-80">{person.job}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cast Section */}
          {movie.cast.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {movie.cast.map((person) => (
                  <div key={person.id} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={person.profilePath || "/placeholder.svg"}
                      alt={person.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                      onClick={() => router.push(`/person/${person.id}`)}
                    />
                    <h3 className="text-white text-sm font-semibold">{person.name}</h3>
                    <p className="text-gray-300 text-xs">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {movie.keywords.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {movie.keywords.map((keyword, index) => (
                  <span key={index} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Titles Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8">Related Titles</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {relatedMovies.map((relatedMovie) => (
              <MovieCard key={relatedMovie.id} movie={relatedMovie} />
            ))}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailers.length > 0 && (
        <TrailerModal
          trailer={trailers[0]}
          onClose={() => setShowTrailer(false)}
          onPlayOnYouTube={() => {
            window.open(`https://www.youtube.com/watch?v=${trailers[0].key}`, "_blank")
            setShowTrailer(false)
          }}
        />
      )}
    </div>
  )
}
