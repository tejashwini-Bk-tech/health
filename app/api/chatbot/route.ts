import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are the Health Equality Bridge assistant for underserved and remote communities.

Social Impact Innovation rules:
1) Health Equality Bridge
- Brings world-class health intelligence to remote villages.
- Eliminates language barriers in health communication.
- Provides free AI health consultation to underserved communities.
- Empowers local health workers with predictive tools.

2) Community Resilience Building
- Early warnings prevent panic and enable preparation.
- Culturally appropriate advice increases compliance.
- Builds trust in modern healthcare systems.
- Reduces disease transmission through timely intervention.

Behavior rules:
- Be clear, calm, and culturally sensitive.
- Prefer practical next steps with simple language.
- If symptoms suggest danger, mark urgency as "high" and advise immediate local medical help.
- Never claim diagnosis certainty; provide supportive guidance.
- Default language is English unless user asks for another language.

Output JSON with fields: response, language, urgency, userId, timestamp.`

type IncomingBody = {
  message?: string
  userId?: string
  timestamp?: string
}

function buildMockResponse(message: string, userId: string) {
  const text = message.toLowerCase()
  let response =
    "I can help with water safety, hygiene, fever care, diarrhea prevention, and when to seek urgent care. Tell me your symptoms or concern."
  let urgency: "normal" | "medium" | "high" = "normal"

  if (text.includes("fever") || text.includes("temperature")) {
    response =
      "For fever: drink clean fluids, rest, and monitor temperature every 6-8 hours. If fever is very high, lasts more than 2 days, or includes breathing difficulty, seek nearby medical care now."
    urgency = "medium"
  }

  if (text.includes("diarrhea") || text.includes("loose motion")) {
    response =
      "For diarrhea: start ORS immediately, continue fluids, and avoid unsafe water. If there is blood in stool, no urination, severe weakness, or symptoms in a child/elderly person, go to a clinic urgently."
    urgency = "high"
  }

  if (text.includes("cough") || text.includes("breath") || text.includes("chest pain")) {
    response =
      "For cough or breathing issues: rest, hydrate, and avoid smoke exposure. If breathing is fast, there is chest pain, bluish lips, or confusion, get emergency medical help immediately."
    urgency = "high"
  }

  if (text.includes("water") || text.includes("contaminated") || text.includes("dirty")) {
    response =
      "Use boiled/filtered/chlorinated water for drinking. Store water in covered clean containers and wash hands before handling food. Report suspected contaminated water sources to local health workers."
    urgency = "normal"
  }

  if (text.includes("mosquito") || text.includes("dengue") || text.includes("malaria")) {
    response =
      "Prevent mosquito illness by removing stagnant water, using nets/repellent, and wearing full sleeves. If high fever with severe body pain or vomiting appears, seek medical evaluation quickly."
    urgency = "medium"
  }

  if (text.includes("pregnant") || text.includes("pregnancy")) {
    response =
      "During pregnancy, any fever, bleeding, swelling, severe headache, or reduced fetal movement needs urgent medical review. Please contact your nearest health center as soon as possible."
    urgency = "high"
  }

  return {
    response,
    language: "en",
    urgency,
    userId,
    timestamp: new Date().toISOString(),
  }
}

export async function POST(request: Request) {
  try {
    const webhookUrl =
      process.env.N8N_CHATBOT_WEBHOOK_URL ||
      process.env.N8N_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_CHATBOT_WEBHOOK_URL

    const body = (await request.json()) as IncomingBody
    const message = body.message?.trim()
    const userId = body.userId?.trim() || "anonymous-user"

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!webhookUrl) {
      return NextResponse.json(buildMockResponse(message, userId))
    }

    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp: body.timestamp || new Date().toISOString(),
        systemPrompt: SYSTEM_PROMPT,
        context: {
          initiative: "Social Impact Innovation",
          pillars: ["Health Equality Bridge", "Community Resilience Building"],
        },
      }),
      cache: "no-store",
    })

    const rawText = await upstream.text()

    if (!upstream.ok) {
      return NextResponse.json(buildMockResponse(message, userId))
    }

    const data = (() => {
      try {
        return rawText ? JSON.parse(rawText) : {}
      } catch {
        return { response: rawText }
      }
    })()
    const normalized = Array.isArray(data) ? data[0] ?? {} : data

    return NextResponse.json({
      response:
        normalized.response ??
        normalized.reply ??
        normalized.output ??
        "I received your message and will assist you shortly.",
      language: normalized.language ?? "en",
      urgency: normalized.urgency ?? "normal",
      userId: normalized.userId ?? userId,
      timestamp: normalized.timestamp ?? new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chatbot API error:", error)
    return NextResponse.json(
      buildMockResponse("general health guidance", "anonymous-user")
    )
  }
}
