"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Header from "@/components/Header"
import { ArrowLeft, User, Heart, Bookmark, Eye, List } from "lucide-react"

export default function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    watchlist: 0,
    watched: 0,
    favorites: 0,
    lists: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    fetchUserStats()
  }, [currentUser])

  const fetchUserStats = async () => {
    if (!currentUser) return

    try {
      const [watchlistQuery, watchedQuery, favoritesQuery] = await Promise.all([
        getDocs(query(collection(db, "watchlists"), where("userId", "==", currentUser.uid))),
        getDocs(query(collection(db, "watched"), where("userId", "==", currentUser.uid))),
        getDocs(query(collection(db, "favorites"), where("userId", "==", currentUser.uid))),
      ])

      setStats({
        watchlist: watchlistQuery.size,
        watched: watchedQuery.size,
        favorites: favoritesQuery.size,
        lists: 0, // Will implement custom lists later
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return null
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
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentUser.displayName || currentUser.email}</h1>
              <p className="text-blue-100">Member since {new Date(currentUser.metadata.creationTime).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Bookmark className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.watchlist}</div>
            <div className="text-gray-600">Watchlist</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Eye className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.watched}</div>
            <div className="text-gray-600">Watched</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.favorites}</div>
            <div className="text-gray-600">Favorites</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <List className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.lists}</div>
            <div className="text-gray-600">Custom Lists</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push("/watchlist")}
            className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Bookmark className="w-6 h-6 text-yellow-500 mb-2" />
            <h3 className="font-semibold">My Watchlist</h3>
            <p className="text-gray-600 text-sm">Movies to watch later</p>
          </button>

          <button
            onClick={() => router.push("/watched")}
            className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Eye className="w-6 h-6 text-green-500 mb-2" />
            <h3 className="font-semibold">Watched Movies</h3>
            <p className="text-gray-600 text-sm">Movies you've seen</p>
          </button>

          <button
            onClick={() => router.push("/favorites")}
            className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Heart className="w-6 h-6 text-red-500 mb-2" />
            <h3 className="font-semibold">Favorite Movies</h3>
            <p className="text-gray-600 text-sm">Your all-time favorites</p>
          </button>

          <button
            onClick={() => router.push("/mylibrary")}
            className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <List className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold">My Library</h3>
            <p className="text-gray-600 text-sm">Manage your lists</p>
          </button>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="space-y-2">
            <button className="text-blue-600 hover:text-blue-800 block">Edit Profile</button>
            <button className="text-blue-600 hover:text-blue-800 block">Change Password</button>
            <button className="text-blue-600 hover:text-blue-800 block">Privacy Settings</button>
            <button onClick={logout} className="text-red-600 hover:text-red-800 block">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
