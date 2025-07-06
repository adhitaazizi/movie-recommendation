const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

// Specific movie IDs for hero carousel
const HERO_MOVIE_IDS = [
  155, // The Dark Knight
  872585, // Oppenheimer
  1895, // Star Wars: Episode III - Revenge of the Sith
  205596, // The Imitation Game
]

const formatMovie = (movie) => ({
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
  poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "/placeholder.svg?height=300&width=200",
  backdrop: movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "/placeholder.svg?height=400&width=800",
  overview: movie.overview || "",
  genres: movie.genre_ids || [],
})

const formatTVShow = (show) => ({
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
  poster: show.poster_path ? `${TMDB_IMAGE_BASE_URL}${show.poster_path}` : "/placeholder.svg?height=300&width=200",
  backdrop: show.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
    : "/placeholder.svg?height=400&width=800",
  overview: show.overview || "",
  genres: show.genre_ids || [],
  type: "tv",
})

export const tmdbApi = {
  getTrending: async (timeWindow = "day") => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch trending movies")
      const data = await response.json()
      return data.results.map(formatMovie)
    } catch (error) {
      console.error("Error fetching trending movies:", error)
      return []
    }
  },

  getTopRated: async () => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch top rated movies")
      const data = await response.json()
      return data.results.map(formatMovie)
    } catch (error) {
      console.error("Error fetching top rated movies:", error)
      return []
    }
  },

  getPopular: async () => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch popular movies")
      const data = await response.json()
      return data.results.map(formatMovie)
    } catch (error) {
      console.error("Error fetching popular movies:", error)
      return []
    }
  },

  getRecommended: async () => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch recommended movies")
      const data = await response.json()
      return data.results.slice(0, 15).map(formatMovie)
    } catch (error) {
      console.error("Error fetching recommended movies:", error)
      return []
    }
  },

  getTVShows: async () => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch TV shows")
      const data = await response.json()
      return data.results.map(formatTVShow)
    } catch (error) {
      console.error("Error fetching TV shows:", error)
      return []
    }
  },

  getRecommendedTVShows: async () => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch recommended TV shows")
      const data = await response.json()
      return data.results.slice(0, 15).map(formatTVShow)
    } catch (error) {
      console.error("Error fetching recommended TV shows:", error)
      return []
    }
  },

  getHeroMovies: async () => {
    try {
      const moviePromises = HERO_MOVIE_IDS.map(async (id) => {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`)
        if (!response.ok) return null
        const movie = await response.json()
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview || "",
          releaseDate: movie.release_date
            ? new Date(movie.release_date).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "TBA",
          rating: Math.round(movie.vote_average * 10),
          poster: movie.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
            : "/placeholder.svg?height=300&width=200",
          backdrop: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : "/placeholder.svg?height=400&width=800",
          genres: movie.genres ? movie.genres.map((g) => g.name) : [],
        }
      })

      const movies = await Promise.all(moviePromises)
      return movies.filter((movie) => movie !== null)
    } catch (error) {
      console.error("Error fetching hero movies:", error)
      return []
    }
  },

  getMovieDetails: async (movieId) => {
    try {
      // Fetch movie details
      const movieResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`)
      if (!movieResponse.ok) throw new Error("Failed to fetch movie details")
      const movie = await movieResponse.json()

      // Fetch credits (cast and crew)
      const creditsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
      const credits = creditsResponse.ok ? await creditsResponse.json() : { cast: [], crew: [] }

      // Fetch keywords
      const keywordsResponse = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/keywords?api_key=${TMDB_API_KEY}`)
      const keywords = keywordsResponse.ok ? await keywordsResponse.json() : { keywords: [] }

      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "",
        tagline: movie.tagline || "",
        releaseDate: movie.release_date
          ? new Date(movie.release_date).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "TBA",
        rating: movie.vote_average || 0,
        runtime: movie.runtime || 0,
        genres: movie.genres ? movie.genres.map((g) => g.name) : [],
        poster: movie.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
          : "/placeholder.svg?height=600&width=400",
        backdrop: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
          : "/placeholder.svg?height=400&width=800",
        cast: credits.cast
          ? credits.cast.slice(0, 10).map((person) => ({
              id: person.id,
              name: person.name,
              character: person.character,
              profilePath: person.profile_path
                ? `${TMDB_IMAGE_BASE_URL}${person.profile_path}`
                : "/placeholder.svg?height=200&width=150",
            }))
          : [],
        crew: credits.crew
          ? credits.crew
              .filter((person) => person.job === "Director" || person.job === "Writer" || person.job === "Producer")
              .slice(0, 5)
              .map((person) => ({
                id: person.id,
                name: person.name,
                job: person.job,
                profilePath: person.profile_path
                  ? `${TMDB_IMAGE_BASE_URL}${person.profile_path}`
                  : "/placeholder.svg?height=200&width=150",
              }))
          : [],
        keywords: keywords.keywords ? keywords.keywords.slice(0, 10).map((keyword) => keyword.name) : [],
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
      return null
    }
  },

  getVideos: async (movieId) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`)
      if (!response.ok) throw new Error("Failed to fetch videos")
      const data = await response.json()
      return data.results.filter((video) => video.type === "Trailer" && video.site === "YouTube")
    } catch (error) {
      console.error("Error fetching videos:", error)
      return []
    }
  },

  searchMovies: async (query) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
      )
      if (!response.ok) throw new Error("Failed to search movies")
      const data = await response.json()

      // Filter out items that don't have required data and format them
      return data.results
        .filter((item) => {
          // Filter out items without title/name or poster
          if (item.media_type === "tv") {
            return item.name && (item.poster_path || item.backdrop_path)
          } else if (item.media_type === "movie") {
            return item.title && (item.poster_path || item.backdrop_path)
          }
          return false
        })
        .map((item) => {
          if (item.media_type === "tv") {
            return formatTVShow(item)
          } else {
            return formatMovie(item)
          }
        })
    } catch (error) {
      console.error("Error searching movies:", error)
      return []
    }
  },

  getMoviesByIds: async (movieIds) => {
    if (!movieIds || movieIds.length === 0) return []

    const moviePromises = movieIds.map(async (id) => {
      try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`)
        if (!response.ok) return null

        const movie = await response.json()
        return {
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
            ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
            : "/placeholder.svg?height=300&width=200",
          backdrop: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : "/placeholder.svg?height=400&width=800",
          overview: movie.overview || "",
          genres: movie.genres ? movie.genres.map((g) => g.name) : [],
        }
      } catch (error) {
        console.error(`Error fetching movie ${id}:`, error)
        return null
      }
    })

    const movies = await Promise.all(moviePromises)
    return movies.filter((movie) => movie !== null)
  },
}
