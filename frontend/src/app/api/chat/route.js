export async function POST(request) {
  try {
    const { message } = await request.json()

    // Mock API call to your recommendation system
    // Replace this URL with your actual recommendation API
    const response = await fetch("YOUR_RECOMMENDATION_API_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error("API request failed")
    }

    const data = await response.json()

    // Expected response format: { text: string, movieIds?: number[] }
    return Response.json({
      text: data.text,
      movieIds: data.movieIds || [],
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Fallback response for demo purposes
    const lowerMessage = request.message?.toLowerCase() || "action"

    if (lowerMessage.includes("action") || lowerMessage.includes("adventure")) {
      return Response.json({
        text: "Here are some great action movies I recommend:",
        movieIds: [550, 155, 13, 24428], // Fight Club, The Dark Knight, Forrest Gump, The Avengers
      })
    } else if (lowerMessage.includes("comedy")) {
      return Response.json({
        text: "Here are some hilarious comedies:",
        movieIds: [105, 637, 120, 11], // Back to the Future, The Mask, The Lord of the Rings, Star Wars
      })
    } else {
      return Response.json({
        text: "I'm here to help you discover great movies! Try asking me about action movies, comedies, or any specific genre you're interested in.",
      })
    }
  }
}
