import { tmdbApi } from "@/lib/tmdb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return Response.json({ results: [] })
    }

    const results = await tmdbApi.searchMovies(query)
    return Response.json({ results })
  } catch (error) {
    console.error("Search API error:", error)
    return Response.json({ results: [] }, { status: 500 })
  }
}
