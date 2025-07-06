"use client"
import { useAuth } from "../../../contexts/AuthContext"
import Header from "../../../components/Header"
import MediaList from "../../../components/MediaList"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FavoritesPage() {
  const { currentUser } = useAuth()
  const router = useRouter()

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
        <MediaList
          title="Favorite Movies & TV Shows"
          listType="favorites"
          currentUser={currentUser}
          emptyMessage="You have no favorite movies or TV shows yet."
          emptySubMessage="Start adding favorites to see them here!"
        />
      </div>
    </div>
  )
}
