import type { AIProvider, ChatMessage } from "../../types"

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic",
  baseUrl: "https://api.anthropic.com/v1/messages",
  headers: (apiKey: string) => ({
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  }),
  formatBody: (messages: ChatMessage[], model: string, system?: string) => {
    const systemMsg = system ? [{ type: "text", text: system }] : undefined
    const userMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    return {
      model,
      max_tokens: 8192,
      ...(systemMsg ? { system: systemMsg } : {}),
      messages: userMessages,
      stream: true,
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
            if (json.type === "content_block_delta" && json.delta?.text) {
              yield json.delta.text
            }
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
