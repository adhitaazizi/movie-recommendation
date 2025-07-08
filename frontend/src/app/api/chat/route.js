import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { message, userId } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Forward the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/chat', {
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

    // Fallback response based on message content for development
    const messageContent = request.body?.message?.toLowerCase() || ""

    let fallbackResponse = {
      text: "I'm sorry, I'm having trouble connecting to the chatbot service right now. Here's what I can suggest:",
      movieIds: [],
      error: "Service temporarily unavailable",
    }

    // Provide some basic fallback recommendations
    if (messageContent.includes("action") || messageContent.includes("adventure")) {
      fallbackResponse = {
        text: "I'm having connection issues, but here are some popular action movies:",
        movieIds: [550, 155, 13, 24428, 27205], // Fight Club, Dark Knight, Forrest Gump, Avengers, Inception
      }
    } else if (messageContent.includes("comedy") || messageContent.includes("funny")) {
      fallbackResponse = {
        text: "Connection issues, but here are some great comedies:",
        movieIds: [19404, 105, 9806, 11036, 13], // Deadpool, Back to the Future, The Incredibles, The Grand Budapest Hotel, Finding Nemo
      }
    } else if (messageContent.includes("horror") || messageContent.includes("scary")) {
      fallbackResponse = {
        text: "Can't connect right now, but here are some horror classics:",
        movieIds: [694, 539, 1724, 4232, 10144], // The Shining, Psycho, The Exorcist, Alien, The Ring
      }
    } else if (messageContent.includes("romance") || messageContent.includes("love")) {
      fallbackResponse = {
        text: "Service issues, but here are some romantic movies:",
        movieIds: [19404, 11036, 597, 10681, 597], // Titanic, Casablanca, The Notebook, WALL-E, Titanic
      }
    }

    return NextResponse.json(fallbackResponse, { status: 200 })
  }
}

// Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: "Chat API is running",
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
