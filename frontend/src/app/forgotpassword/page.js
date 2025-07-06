"use client"
import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"
import Toast from "@/components/Toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [toast, setToast] = useState(null)

  const showToast = (message, type = "info") => {
    setToast({ message, type })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Password reset email sent! Check your inbox.")
      showToast("Password reset email sent!", "success")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-cyan-400">
              TMDB
            </Link>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Reset Password</h2>
            <p className="text-gray-600 mt-2">Enter your email to receive a password reset link</p>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-cyan-400 hover:text-cyan-500 text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
