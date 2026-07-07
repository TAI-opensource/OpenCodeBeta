import type { AIProvider, ChatMessage } from "../../types"

export const googleProvider: AIProvider = {
  id: "google",
  name: "Google Gemini",
  baseUrl: "https://generativelanguage.googleapis.com/v1beta/",
  headers: (apiKey: string) => ({
    "Content-Type": "application/json",
  }),
  formatBody: (messages: ChatMessage[], model: string) => {
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))
    const systemMsg = messages.find((m) => m.role === "system")
    return {
      contents,
      ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg.content }] } } : {}),
      generationConfig: { responseModalities: ["TEXT"] },
    }
  },
  parseStream: async function* (reader) {
    const decoder = new TextDecoder()
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith("data: ")) continue
          const data = trimmed.slice(6)

          try {
            const json = JSON.parse(data)
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) yield text
          } catch {
            // skip non-JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },
}
