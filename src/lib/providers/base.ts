import type { AIProvider, ChatMessage } from "../../types"

export async function* streamSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  extractData?: (line: string) => string | null
): AsyncIterable<string> {
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
        if (data === "[DONE]") return

        try {
          const json = JSON.parse(data)
          const content = extractData
            ? extractData(data)
            : json.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // skip non-JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function createOpenAIProvider(
  id: string,
  name: string,
  baseUrl: string
): AIProvider {
  return {
    id,
    name,
    baseUrl,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    formatBody: (messages: ChatMessage[], model: string, system?: string) => {
      const allMessages = system
        ? [{ role: "system", content: system }, ...messages]
        : messages
      return {
        model,
        messages: allMessages,
        stream: true,
      }
    },
    parseStream: (reader) => streamSSE(reader),
  }
}
