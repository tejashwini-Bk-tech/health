"use client"

import { useMemo, useState } from "react"
import { BottomNav } from "@/components/BottomNav"
import { sendToChatbot } from "@/lib/chatbot-service"
import { Bot, Loader2, Send, User } from "lucide-react"

type Msg = {
  id: string
  role: "user" | "bot"
  text: string
  createdAt: string
}

export default function ChatbotPage() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi, I am your health assistant. Tell me your symptoms or question.",
      createdAt: new Date().toISOString(),
    },
  ])

  const userId = useMemo(() => `user-${Date.now()}`, [])

  const onSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Msg = {
      id: `${Date.now()}-u`,
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await sendToChatbot(text, userId)
      const botMsg: Msg = {
        id: `${Date.now()}-b`,
        role: "bot",
        text: res.response || "I received your message.",
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: "bot",
          text: "Connection issue. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-cyan-50 pb-28">
      <section className="mx-auto w-full max-w-3xl px-4 pt-6">
        <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Health Chatbot</h1>
              <p className="text-xs text-gray-500">Connected to n8n webhook</p>
            </div>
          </div>

          <div className="h-[62vh] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-emerald-600 text-white" : "bg-white text-gray-800"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1 text-[11px] opacity-70">
                      {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      <span>{m.role === "user" ? "You" : "Assistant"}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder="Type your health question..."
              className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-emerald-500"
              disabled={loading}
            />
            <button
              onClick={onSend}
              disabled={loading || !input.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </div>
      </section>
      <BottomNav />
    </main>
  )
}

