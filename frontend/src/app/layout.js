import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TMDB - Movie Recommendation",
  description: "Discover millions of movies, TV shows and people",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
