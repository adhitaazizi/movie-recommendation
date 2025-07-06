"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/Header"
import MovieCard from "@/components/MovieCard"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"

export default function PersonPage() {
  const params = useParams()
  const router = useRouter()
  const [person, setPerson] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPersonDetails()
  }, [params.id])

  const fetchPersonDetails = async () => {
    try {
      // Fetch person details
      const personResponse = await fetch(
        `https://api.themoviedb.org/3/person/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      )
      const personData = await personResponse.json()

      // Fetch person's movies
      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${params.id}/movie_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
      )
      const creditsData = await creditsResponse.json()

      setPerson({
        id: personData.id,
        name: personData.name,
        biography: personData.biography,
        birthday: personData.birthday,
        placeOfBirth: personData.place_of_birth,
        profilePath: personData.profile_path
          ? `https://image.tmdb.org/t/p/w500${personData.profile_path}`
          : "/placeholder.svg?height=600&width=400",
        knownFor: personData.known_for_department,
      })

      // Format movies
      const formattedMovies = creditsData.cast.slice(0, 20).map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date
          ? new Date(movie.release_date).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "TBA",
        rating: Math.round(movie.vote_average * 10),
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/placeholder.svg?height=300&width=200",
        character: movie.character,
      }))

      setMovies(formattedMovies)
    } catch (error) {
      console.error("Error fetching person details:", error)
    } finally {
      setLoading(false)
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

  if (!person) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Person not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Person Photo */}
          <div className="flex-shrink-0">
            <img
              src={person.profilePath || "/placeholder.svg"}
              alt={person.name}
              className="w-80 h-auto object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Person Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{person.name}</h1>

            <div className="space-y-4 mb-8">
              {person.knownFor && (
                <div>
                  <h3 className="font-semibold text-gray-700">Known For</h3>
                  <p className="text-gray-600">{person.knownFor}</p>
                </div>
              )}

              {person.birthday && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Born {new Date(person.birthday).toLocaleDateString()}</span>
                </div>
              )}

              {person.placeOfBirth && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">{person.placeOfBirth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Biography</h2>
                <p className="text-gray-700 leading-relaxed">{person.biography}</p>
              </div>
            )}
          </div>
        </div>

        {/* Movies */}
        {movies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8">Known For</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <div key={movie.id}>
                  <MovieCard movie={movie} />
                  {movie.character && <p className="text-sm text-gray-600 mt-2">as {movie.character}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
