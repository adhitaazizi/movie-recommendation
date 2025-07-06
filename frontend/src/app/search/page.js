"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "../../components/Header"
import MovieCard from "../../components/MovieCard"
import { Search } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(query)

  useEffect(() => {
    setSearchQuery(query)
    if (query) {
      fetchSearchResults()
    } else {
      setLoading(false)
    }
  }, [query])

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for movies, TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 rounded-l-full border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="bg-cyan-400 hover:bg-cyan-500 px-8 py-4 rounded-r-full text-black font-semibold flex items-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        <h1 className="text-3xl font-bold mb-8">{query ? `Search Results for "${query}"` : "Search"}</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Searching...</div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No results found.</p>
            {query && <p className="text-gray-500">Try searching with different keywords.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {searchResults.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
