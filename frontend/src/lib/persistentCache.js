class PersistentCache {
  constructor() {
    this.cache = new Map()
    this.isClient = typeof window !== "undefined"

    // Load cache from sessionStorage on initialization
    if (this.isClient) {
      this.loadFromStorage()

      // Clear cache when user closes the app
      window.addEventListener("beforeunload", () => {
        this.clear()
      })
    }
  }

  loadFromStorage() {
    try {
      const stored = sessionStorage.getItem("movieCache")
      if (stored) {
        const data = JSON.parse(stored)
        this.cache = new Map(Object.entries(data))
      }
    } catch (error) {
      console.error("Error loading cache from storage:", error)
    }
  }

  saveToStorage() {
    if (!this.isClient) return

    try {
      const data = Object.fromEntries(this.cache)
      sessionStorage.setItem("movieCache", JSON.stringify(data))
    } catch (error) {
      console.error("Error saving cache to storage:", error)
    }
  }

  set(key, data) {
    this.cache.set(key, data)
    this.saveToStorage()
  }

  get(key) {
    return this.cache.get(key) || null
  }

  clear() {
    this.cache.clear()
    if (this.isClient) {
      sessionStorage.removeItem("movieCache")
    }
  }

  has(key) {
    return this.cache.has(key)
  }
}

export const persistentCache = new PersistentCache()
