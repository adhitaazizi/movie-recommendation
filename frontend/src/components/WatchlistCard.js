"use client"
import Link from "next/link"

export default function WatchlistCard({ item }) {
  return (
    <div className="relative group cursor-pointer">
      <Link href={item.type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`}>
        <div className="relative">
          <img
            src={item.poster || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1 text-white">{item.title}</h3>
          <p className="text-gray-400 text-xs">{item.releaseDate}</p>
        </div>
      </Link>
    </div>
  )
}
