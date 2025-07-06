"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../lib/firebase"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = () => {}

    try {
      if (auth && auth.onAuthStateChanged) {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user)
          setLoading(false)
        })
      } else {
        // Demo mode - no authentication
        setCurrentUser(null)
        setLoading(false)
      }
    } catch (error) {
      console.warn("Auth initialization failed, using demo mode:", error)
      setCurrentUser(null)
      setLoading(false)
    }

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      if (auth && signOut) {
        return await signOut(auth)
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const value = {
    currentUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
