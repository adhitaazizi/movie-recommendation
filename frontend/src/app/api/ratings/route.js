// This is a mock API - replace with your actual database implementation
const ratings = new Map()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const itemId = searchParams.get("itemId")

    if (!userId || !itemId) {
      return Response.json({ error: "Missing userId or itemId" }, { status: 400 })
    }

    const key = `${userId}_${itemId}`
    const rating = ratings.get(key) || 0

    return Response.json({ rating })
  } catch (error) {
    console.error("Rating API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId, itemId, rating } = await request.json()

    if (!userId || !itemId || rating < 0 || rating > 5) {
      return Response.json({ error: "Invalid data" }, { status: 400 })
    }

    const key = `${userId}_${itemId}`
    ratings.set(key, rating)

    // In a real implementation, you would save this to your database
    // Example:
    // await db.collection('ratings').doc(key).set({
    //   userId,
    //   itemId,
    //   rating,
    //   updatedAt: new Date()
    // })

    return Response.json({ success: true, rating })
  } catch (error) {
    console.error("Rating API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
