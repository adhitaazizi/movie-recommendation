export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const movieId = searchParams.get("movieId") // For related movies

    // Mock API call to your recommendation system
    // Replace this URL with your actual recommendation API
    const response = await fetch("YOUR_MOVIE_RECOMMENDATION_API_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, movieId }),
    })

    if (!response.ok) {
      throw new Error("Recommendation API request failed")
    }

    const data = await response.json()

    // Expected response format: { movieIds: number[] }
    return Response.json({
      movieIds: data.movieIds || [],
    })
  } catch (error) {
    console.error("Recommendation API error:", error)

    // Fallback response for demo purposes
    return Response.json({
      movieIds: [550, 155, 13, 24428, 11, 120, 637, 105], // Sample movie IDs
    })
  }
}
