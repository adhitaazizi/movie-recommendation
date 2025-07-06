"use client"
import { useState } from "react"
import { Play, MoreHorizontal } from "lucide-react"

export default function TrailerSection() {
  const [activeTab, setActiveTab] = useState("Popular")
  const tabs = ["Popular", "Streaming", "On TV", "For Rent", "In Theaters"]

  const trailers = [
    {
      id: 1,
      title: "Demon Slayer: Kimetsu no Yaiba Infinity Castle Movie 1 - Akaza's Revenge",
      subtitle: "Demon Slayer: Kimetsu no Yaiba Infinity Castle | DUB TRAILER",
      thumbnail: "/placeholder.svg?height=250&width=400",
    },
    {
      id: 2,
      title: "Robot Chicken",
      subtitle: "Robot Chicken: Self-Discovery Special - Official Trailer",
      thumbnail: "/placeholder.svg?height=250&width=400",
    },
    {
      id: 3,
      title: "Eddington",
      subtitle: "Trailer #2",
      thumbnail: "/placeholder.svg?height=250&width=400",
    },
    {
      id: 4,
      title: "Jurassic World Rebirth",
      subtitle: "A flying carnivore the size of an F-16",
      thumbnail: "/placeholder.svg?height=250&width=400",
    },
  ]

  return (
    <section className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-6 mb-8">
          <h2 className="text-2xl font-bold">Latest Trailers</h2>
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-cyan-400 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trailers.map((trailer) => (
            <div key={trailer.id} className="relative group cursor-pointer">
              <div className="relative">
                <img
                  src={trailer.thumbnail || "/placeholder.svg"}
                  alt={trailer.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div className="absolute top-2 right-2">
                  <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-1">{trailer.title}</h3>
                <p className="text-gray-400 text-xs">{trailer.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
