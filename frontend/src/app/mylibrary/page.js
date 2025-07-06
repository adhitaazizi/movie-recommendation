"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../contexts/AuthContext"
import Header from "../../components/Header"
import { ArrowLeft, Plus, Trash2, Edit, Heart, Bookmark, Eye, List } from "lucide-react"

export default function LibraryPage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [customLists, setCustomLists] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      initializeUserLists()
      fetchCustomLists()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const initializeUserLists = async () => {
    if (!currentUser) return

    try {
      // Check if user has default lists, if not create them
      const defaultLists = ["watchlist", "watched", "favorites"]

      for (const listType of defaultLists) {
        const listDoc = await getDocs(
          query(collection(db, "lists"), where("userId", "==", currentUser.uid), where("type", "==", listType)),
        )

        if (listDoc.empty) {
          // Create default list
          await addDoc(collection(db, "lists"), {
            userId: currentUser.uid,
            name: listType.charAt(0).toUpperCase() + listType.slice(1),
            type: listType,
            movieIds: [],
            createdAt: new Date(),
            isDefault: true,
          })
        }
      }
    } catch (error) {
      console.error("Error initializing user lists:", error)
    }
  }

  const fetchCustomLists = async () => {
    try {
      const q = query(collection(db, "lists"), where("userId", "==", currentUser.uid), where("isDefault", "!=", true))
      const querySnapshot = await getDocs(q)
      const lists = []
      querySnapshot.forEach((doc) => {
        lists.push({ id: doc.id, ...doc.data() })
      })
      setCustomLists(lists)
    } catch (error) {
      console.error("Error fetching custom lists:", error)
    } finally {
      setLoading(false)
    }
  }

  const createList = async () => {
    if (!newListName.trim()) return

    try {
      await addDoc(collection(db, "lists"), {
        userId: currentUser.uid,
        name: newListName,
        type: "custom",
        movieIds: [],
        createdAt: new Date(),
        isDefault: false,
      })
      setNewListName("")
      setShowCreateModal(false)
      fetchCustomLists()
    } catch (error) {
      console.error("Error creating list:", error)
    }
  }

  const deleteList = async (listId) => {
    if (confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteDoc(doc(db, "lists", listId))
        fetchCustomLists()
      } catch (error) {
        console.error("Error deleting list:", error)
      }
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">My Library</h1>
            <p className="text-gray-600">Please login to view your library.</p>
          </div>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Library</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create List</span>
          </button>
        </div>

        {/* Default Lists */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Default Lists</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => router.push("/mylibrary/watchlist")}
              className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
            >
              <Bookmark className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-lg">Watchlist</h3>
              <p className="text-gray-600">Movies you want to watch</p>
            </div>

            <div
              onClick={() => router.push("/mylibrary/watched")}
              className="bg-green-50 border border-green-200 p-6 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            >
              <Eye className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-lg">Watched</h3>
              <p className="text-gray-600">Movies you've already seen</p>
            </div>

            <div
              onClick={() => router.push("/mylibrary/favorites")}
              className="bg-red-50 border border-red-200 p-6 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
            >
              <Heart className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-lg">Favorites</h3>
              <p className="text-gray-600">Your all-time favorite movies</p>
            </div>
          </div>
        </div>

        {/* Custom Lists */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom Lists</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading your lists...</div>
            </div>
          ) : customLists.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No custom lists yet</p>
              <p className="text-gray-500">Create your first custom list to organize your movies</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white border border-gray-200 p-6 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/mylibrary/custom/${list.id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <List className="w-6 h-6 text-blue-600" />
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Edit functionality
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteList(list.id)
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{list.name}</h3>
                  <p className="text-gray-600">{list.movieIds?.length || 0} items</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create New List</h3>
            <input
              type="text"
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button onClick={createList} className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 rounded-md">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
