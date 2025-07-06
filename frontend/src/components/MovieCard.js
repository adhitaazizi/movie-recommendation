"use client"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

export default function MovieCard({ movie, showRating = true }) {
  const getRatingColor = (rating) => {
    if (rating >= 80) return "text-green-400 border-green-400"
    if (rating >= 60) return "text-yellow-400 border-yellow-400"
    return "text-red-400 border-red-400"
  }

  return (
    <div className="relative group cursor-pointer">
      <Link href={movie.type === "tv" ? `/tv/${movie.id}` : `/movie/${movie.id}`}>
        <div className="relative">
          <img
            src={movie.poster || "/placeholder.svg?height=300&width=200"}
            alt={movie.title}
            className="w-full h-80 object-cover rounded-lg"
          />
          {showRating && (
            <div
              className={`absolute -bottom-4 left-4 w-12 h-12 rounded-full border-4 bg-slate-900 flex items-center justify-center text-sm font-bold ${getRatingColor(movie.rating)}`}
            >
              {movie.rating}%
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4 text-gray-700" />
            </div>
          </div>
        </div>
        <div className="mt-6 px-2">
          <h3 className="font-semibold text-lg mb-1">{movie.title}</h3>
          <p className="text-gray-600 text-sm">{movie.releaseDate}</p>
        </div>
      </Link>
    </div>
  )
}
