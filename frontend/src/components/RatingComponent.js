"use client"
import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"

export default function RatingComponent({ itemId, userId, initialRating = 0, onRatingChange }) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    checkWatchedStatus()
  }, [userId, itemId])

  const checkWatchedStatus = async () => {
    if (!userId) return

    try {
      // Check if the item is in the user's watched list
      const listQuery = query(collection(db, "lists"), where("userId", "==", userId), where("type", "==", "watched"))
      const listSnapshot = await getDocs(listQuery)

      if (!listSnapshot.empty) {
        const listDoc = listSnapshot.docs[0]
        const listData = listDoc.data()
        const movieIds = listData.movieIds || []

        const isItemWatched =
          movieIds.includes(itemId) ||
          movieIds.includes(itemId.replace("movie_", "")) ||
          movieIds.includes(itemId.replace("tv_", ""))
        setIsWatched(isItemWatched)
      }
    } catch (error) {
      console.error("Error checking watched status:", error)
    }
  }

  const handleRating = async (newRating) => {
    if (!isWatched) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          itemId,
          rating: newRating,
        }),
      })

      if (response.ok) {
        setRating(newRating)
        onRatingChange?.(newRating)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <span className="text-white font-semibold">Your Rating:</span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={isSubmitting}
              className={`transition-colors disabled:opacity-50 ${!isWatched ? "opacity-50" : ""}`}
            >
              <Star
                className={`w-6 h-6 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400 hover:text-yellow-400"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && <span className="text-yellow-400 font-semibold">{rating}/5</span>}
        {!isWatched && <span className="text-gray-400 text-sm ml-2">(Mark as watched to rate)</span>}
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="absolute top-full left-0 mt-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 whitespace-nowrap">
          You must mark it as watched to rate this movie or show
        </div>
      )}
    </div>
  )
}
