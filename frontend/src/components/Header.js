"use client"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Search, User, X } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Header() {
  const { currentUser, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setShowSearch(false)
    }
  }

  return (
    <header className="bg-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-cyan-400">TMDB</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-cyan-400">
                Film
              </Link>
              <Link href="/" className="hover:text-cyan-400">
                Serial TV
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Cari sebuah film, serial tv, kru / aktor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 rounded-l-full text-black text-sm w-64 bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded-r-full text-black font-semibold"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="ml-2 p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-gray-700 rounded">
                <Search className="w-5 h-5" />
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <div
                  className="w-8 h-8 bg-gray-600 rounded-full cursor-pointer flex items-center justify-center"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User className="w-5 h-5" />
                </div>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-50">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/mylibrary" className="block px-4 py-2 hover:bg-gray-100">
                      My Library
                    </Link>
                    <Link href="/watchlist" className="block px-4 py-2 hover:bg-gray-100">
                      My Watchlist
                    </Link>
                    <Link href="/watched" className="block px-4 py-2 hover:bg-gray-100">
                      Watched Movies
                    </Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hover:text-cyan-400">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
