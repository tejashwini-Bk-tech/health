export interface ChatMessage {
  message: string
  userId: string
  timestamp?: string
}

export interface ChatResponse {
  response: string
  language: string
  urgency: 'normal' | 'medium' | 'high'
  userId: string
  timestamp: string
}

export async function sendToChatbot(message: string, userId: string): Promise<ChatResponse> {
  try {
    const response = await fetch("/api/chatbot", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp: new Date().toISOString()
      })
    })

    const data = await response.json()
    if (!response.ok) {
      const detail = data?.details ? ` Details: ${String(data.details)}` : ""
      return {
        response: `${data?.error || "Chat service is temporarily unavailable."}${detail}`,
        language: "en",
        urgency: "normal",
        userId,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      response: data.response ?? "I am here to help with your health questions.",
      language: data.language ?? "en",
      urgency: data.urgency ?? "normal",
      userId: data.userId ?? userId,
      timestamp: data.timestamp ?? new Date().toISOString(),
    }
  } catch (error) {
    console.error('Chatbot service error:', error)
    throw error
  }
}

// Quick test function
export async function testChatbot() {
  try {
    const result = await sendToChatbot('I have fever', 'test-user')
    console.log('Chatbot test result:', result)
    return result
  } catch (error) {
    console.error('Chatbot test failed:', error)
    return null
  }
}
