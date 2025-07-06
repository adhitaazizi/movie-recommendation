"use client"
import { X, ExternalLink } from "lucide-react"

export default function TrailerModal({ trailer, onClose, onPlayOnYouTube }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{trailer.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}`}
            title={trailer.name}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {trailer.type} • {trailer.site}
          </p>
          <button
            onClick={onPlayOnYouTube}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Watch on YouTube</span>
          </button>
        </div>
      </div>
    </div>
  )
}
