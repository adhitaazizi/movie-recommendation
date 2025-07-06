"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import MovieCard from "@/components/MovieCard"
import TrailerModal from "@/components/TrailerModal"
import RatingComponent from "@/components/RatingComponent"
import { Heart, Bookmark, Play, ArrowLeft, List } from "lucide-react"

export default function TVDetails() {
  const params = useParams()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [tvShow, setTvShow] = useState(null)
  const [relatedShows, setRelatedShows] = useState([])
  const [trailers, setTrailers] = useState([])
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTVShow = async () => {
      try {
        const tvData = await fetchTVDetails(params.id)
        setTvShow(tvData)

        const videoData = await fetchTVVideos(params.id)
        setTrailers(videoData)

        const related = await fetchRelatedTVShows()
        setRelatedShows(related)

        if (currentUser) {
          await checkWatchlistStatus()
          await fetchUserRating()
        }
      } catch (error) {
        console.error("Error fetching TV show:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTVShow()
  }, [params.id, currentUser])

  const fetchTVDetails = async (tvId) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    )
    const tv = await response.json()

    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    )
    const credits = creditsResponse.ok ? await creditsResponse.json() : { cast: [], crew: [] }

    const keywordsResponse = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/keywords?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    )
    const keywords = keywordsResponse.ok ? await keywordsResponse.json() : { results: [] }

    return {
      id: tv.id,
      title: tv.name,
      overview: tv.overview || "",
      tagline: tv.tagline || "",
      firstAirDate: tv.first_air_date
        ? new Date(tv.first_air_date).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "TBA",
      rating: tv.vote_average || 0,
      numberOfSeasons: tv.number_of_seasons || 0,
      numberOfEpisodes: tv.number_of_episodes || 0,
      genres: tv.genres ? tv.genres.map((g) => g.name) : [],
      poster: tv.poster_path
        ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
        : "/placeholder.svg?height=600&width=400",
      backdrop: tv.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`
        : "/placeholder.svg?height=400&width=800",
      cast: credits.cast
        ? credits.cast.slice(0, 10).map((person) => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profilePath: person.profile_path
              ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
              : "/placeholder.svg?height=200&width=150",
          }))
        : [],
      crew: credits.crew
        ? credits.crew
            .filter(
              (person) => person.job === "Executive Producer" || person.job === "Creator" || person.job === "Writer",
            )
            .slice(0, 5)
            .map((person) => ({
              id: person.id,
              name: person.name,
              job: person.job,
              profilePath: person.profile_path
                ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                : "/placeholder.svg?height=200&width=150",
            }))
        : [],
      keywords: keywords.results ? keywords.results.slice(0, 10).map((keyword) => keyword.name) : [],
    }
  }

  const fetchTVVideos = async (tvId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tvId}/videos?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      )
      if (!response.ok) throw new Error("Failed to fetch videos")
      const data = await response.json()
      return data.results.filter((video) => video.type === "Trailer" && video.site === "YouTube")
    } catch (error) {
      console.error("Error fetching videos:", error)
      return []
    }
  }

  const fetchRelatedTVShows = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      )
      const data = await response.json()
      return data.results.slice(0, 6).map((show) => ({
        id: show.id,
        title: show.name,
        releaseDate: show.first_air_date
          ? new Date(show.first_air_date).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "TBA",
        rating: Math.round(show.vote_average * 10),
        poster: show.poster_path
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
          : "/placeholder.svg?height=300&width=200",
        type: "tv",
      }))
    } catch (error) {
      console.error("Error fetching related TV shows:", error)
      return []
    }
  }

  const checkWatchlistStatus = async () => {
    if (!currentUser) return

    try {
      const tvId = `tv_${params.id}`
      const watchlistDoc = await getDoc(doc(db, "watchlists", `${currentUser.uid}_${tvId}`))
      setIsInWatchlist(watchlistDoc.exists())

      const watchedDoc = await getDoc(doc(db, "watched", `${currentUser.uid}_${tvId}`))
      setIsWatched(watchedDoc.exists())

      const favoriteDoc = await getDoc(doc(db, "favorites", `${currentUser.uid}_${tvId}`))
      setIsFavorite(favoriteDoc.exists())
    } catch (error) {
      console.error("Error checking status:", error)
    }
  }

  const fetchUserRating = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/ratings?userId=${currentUser.uid}&itemId=tv_${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserRating(data.rating || 0)
      }
    } catch (error) {
      console.error("Error fetching user rating:", error)
    }
  }

  const toggleWatchlist = async () => {
    if (!currentUser) {
      alert("Please login to add to watchlist")
      return
    }

    try {
      const tvId = `tv_${params.id}`
      const docRef = doc(db, "watchlists", `${currentUser.uid}_${tvId}`)

      if (isInWatchlist) {
        await deleteDoc(docRef)
        setIsInWatchlist(false)
      } else {
        await setDoc(docRef, {
          userId: currentUser.uid,
          itemId: tvId,
          type: "tv",
          addedAt: new Date(),
        })
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
      const tvId = `tv_${params.id}`
      const docRef = doc(db, "watched", `${currentUser.uid}_${tvId}`)

      if (isWatched) {
        await deleteDoc(docRef)
        setIsWatched(false)
      } else {
        await setDoc(docRef, {
          userId: currentUser.uid,
          itemId: tvId,
          type: "tv",
          watchedAt: new Date(),
        })
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
      const tvId = `tv_${params.id}`
      const docRef = doc(db, "favorites", `${currentUser.uid}_${tvId}`)

      if (isFavorite) {
        await deleteDoc(docRef)
        setIsFavorite(false)
      } else {
        await setDoc(docRef, {
          userId: currentUser.uid,
          itemId: tvId,
          type: "tv",
          addedAt: new Date(),
        })
        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Error updating favorites:", error)
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

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">TV Show not found</div>
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
            src={tvShow.backdrop || "/placeholder.svg?height=400&width=800"}
            alt={tvShow.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-75"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* TV Show Poster */}
            <div className="flex-shrink-0">
              <img
                src={tvShow.poster || "/placeholder.svg?height=600&width=400"}
                alt={tvShow.title}
                className="w-80 h-auto object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* TV Show Info */}
            <div className="text-white flex-1">
              <h1 className="text-4xl font-bold mb-2">{tvShow.title}</h1>
              <div className="text-lg mb-4 opacity-90">
                {tvShow.firstAirDate} • {tvShow.genres.join(", ")} • {tvShow.numberOfSeasons} Season
                {tvShow.numberOfSeasons > 1 ? "s" : ""} • {tvShow.numberOfEpisodes} Episodes
              </div>

              {tvShow.tagline && <p className="text-xl italic mb-6 opacity-80">{tvShow.tagline}</p>}

              {/* Rating and Actions */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full border-4 border-green-400">
                  <span className="text-lg font-bold text-green-400">{Math.round(tvShow.rating * 10)}%</span>
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
                    itemId={`tv_${params.id}`}
                    userId={currentUser.uid}
                    initialRating={userRating}
                    onRatingChange={setUserRating}
                  />
                </div>
              )}

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-lg leading-relaxed opacity-90">{tvShow.overview}</p>
              </div>

              {/* Cast and Crew Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {tvShow.crew.map((person) => (
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
          {tvShow.cast.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {tvShow.cast.map((person) => (
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
          {tvShow.keywords.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {tvShow.keywords.map((keyword, index) => (
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
          <h2 className="text-2xl font-bold mb-8">Related TV Shows</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {relatedShows.map((relatedShow) => (
              <MovieCard key={relatedShow.id} movie={relatedShow} />
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
