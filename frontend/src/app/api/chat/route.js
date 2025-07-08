import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { message, userId } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Use different URLs based on environment
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? "http://chatbot:5000/api/chat" // Docker service name
        : "http://localhost:5000/api/chat" // Local development

    console.log(`Attempting to connect to: ${backendUrl}`)

    // Forward the request to the Flask backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message,
        userId: userId || "anonymous",
        timestamp: new Date().toISOString(),
      }),
      // Add timeout for better error handling
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error (${response.status}):`, errorText)
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Validate response structure
    if (!data.text) {
      console.warn("Backend response missing 'text' field:", data)
    }

    return NextResponse.json({
      text: data.text || "I'm here to help you find great movies!",
      movieIds: data.movieIds || [],
      recommendations: data.recommendations || [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Get the message content for fallback responses
    let messageContent = ""
    try {
      const requestBody = await request.clone().json()
      messageContent = requestBody.message?.toLowerCase() || ""
    } catch (e) {
      console.warn("Could not parse request body for fallback")
    }

    let fallbackResponse = {
      text: "I'm sorry, I'm having trouble connecting to the chatbot service right now. Here are some popular movies you might enjoy:",
      movieIds: [550, 155, 13, 24428, 27205], // Mix of popular movies
      error: "Service temporarily unavailable",
      fallback: true,
    }

    // Provide contextual fallback recommendations
    if (messageContent.includes("action") || messageContent.includes("adventure")) {
      fallbackResponse = {
        text: "I'm having connection issues, but here are some popular action movies:",
        movieIds: [550, 155, 24428, 27205, 99861], // Fight Club, Dark Knight, Avengers, Inception, Avengers: Age of Ultron
        fallback: true,
      }
    } else if (messageContent.includes("comedy") || messageContent.includes("funny")) {
      fallbackResponse = {
        text: "Connection issues, but here are some great comedies:",
        movieIds: [19404, 105, 9806, 11036, 862], // Deadpool, Back to the Future, The Incredibles, The Grand Budapest Hotel, Toy Story
        fallback: true,
      }
    } else if (messageContent.includes("horror") || messageContent.includes("scary")) {
      fallbackResponse = {
        text: "Can't connect right now, but here are some horror classics:",
        movieIds: [694, 539, 1724, 348, 10144], // The Shining, Psycho, The Exorcist, Alien, The Ring
        fallback: true,
      }
    } else if (messageContent.includes("romance") || messageContent.includes("love")) {
      fallbackResponse = {
        text: "Service issues, but here are some romantic movies:",
        movieIds: [597, 11036, 10681, 194, 1585], // Titanic, Casablanca, WALL-E, The Notebook, It's a Wonderful Life
        fallback: true,
      }
    } else if (messageContent.includes("drama")) {
      fallbackResponse = {
        text: "Having connection problems, but here are some acclaimed dramas:",
        movieIds: [278, 238, 424, 389, 129], // The Shawshank Redemption, The Godfather, Schindler's List, 12 Angry Men, Spirited Away
        fallback: true,
      }
    }

    return NextResponse.json(fallbackResponse, { status: 200 })
  }
}

// Handle GET requests for testing
export async function GET() {
  const backendUrl = process.env.NODE_ENV === "production" ? "http://chatbot:5000" : "http://localhost:5000"

  return NextResponse.json({
    message: "Chat API is running",
    environment: process.env.NODE_ENV || "development",
    backendUrl: backendUrl,
    endpoints: {
      POST: "/api/chat - Send a chat message",
    },
    example: {
      method: "POST",
      body: {
        message: "I want some action movies",
        userId: "optional-user-id",
      },
    },
  })
}
