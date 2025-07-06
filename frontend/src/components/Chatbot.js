"use client"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send } from "lucide-react"
import { tmdbApi } from "../lib/tmdb"
import Link from "next/link"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your movie assistant. Ask me about movies, get recommendations, or help with the website!",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBotResponse = async (userMessage) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      let movies = []
      if (data.movieIds && data.movieIds.length > 0) {
        movies = await tmdbApi.getMoviesByIds(data.movieIds)
      }

      return {
        text: data.text,
        movies: movies,
      }
    } catch (error) {
      console.error("Chatbot error:", error)
      return {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        movies: [],
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      const botResponse = await getBotResponse(currentInput)
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        movies: botResponse.movies || null,
        isBot: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-400 hover:bg-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Enhanced Chat Window - Much Bigger */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[450px] h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col z-40">
          {/* Header */}
          <div className="bg-cyan-400 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Movie Assistant</h3>
            <p className="text-sm text-cyan-100">Ask me anything about movies!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                <div className="max-w-sm">
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      message.isBot ? "bg-gray-100 text-gray-800" : "bg-cyan-400 text-white"
                    }`}
                  >
                    {message.text}
                  </div>

                  {/* Enhanced Movie Cards */}
                  {message.movies && (
                    <div className="mt-3 space-y-3">
                      {message.movies.map((movie) => (
                        <Link key={movie.id} href={`/movie/${movie.id}`}>
                          <div className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer transition-colors border">
                            <div className="flex space-x-3">
                              <img
                                src={movie.poster || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-16 h-20 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">{movie.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{movie.releaseDate}</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-yellow-600">★ {movie.rating}%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{movie.overview}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {movie.genres.slice(0, 2).map((genre) => (
                                    <span key={genre} className="text-xs bg-gray-200 px-2 py-1 rounded">
                                      {genre}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4 flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about movies..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button type="submit" className="bg-cyan-400 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
