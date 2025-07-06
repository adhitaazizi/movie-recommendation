import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-cyan-400 mb-4 block">
              TMDB
            </Link>
            <p className="text-gray-300 mb-4">
              Discover millions of movies, TV shows and people. Your ultimate entertainment companion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-cyan-400">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-cyan-400">
                Twitter
              </a>
              <a href="#" className="text-gray-300 hover:text-cyan-400">
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-cyan-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/recommended" className="text-gray-300 hover:text-cyan-400">
                  Recommended
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="text-gray-300 hover:text-cyan-400">
                  Watchlist
                </Link>
              </li>
              <li>
                <Link href="/watched" className="text-gray-300 hover:text-cyan-400">
                  Watched
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 TMDB. All rights reserved. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  )
}
