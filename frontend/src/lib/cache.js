class MovieCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  }

  set(key, data) {
    this.cache.set(key, data)
    this.timestamps.set(key, Date.now())
  }

  get(key) {
    const timestamp = this.timestamps.get(key)
    if (!timestamp) return null

    const now = Date.now()
    if (now - timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  has(key) {
    const data = this.get(key)
    return data !== null
  }
}

export const movieCache = new MovieCache()

// Clear cache when user closes the app
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    movieCache.clear()
  })
}
