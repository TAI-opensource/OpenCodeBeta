import type { AIProvider, ChatMessage } from "../../types"
import { streamSSE } from "./base"

export const openaiProvider: AIProvider = {
  id: "openai",
  name: "OpenAI",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  headers: (apiKey: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }),
  formatBody: (messages: ChatMessage[], model: string, system?: string) => {
    const allMessages = system
      ? [{ role: "system", content: system }, ...messages]
      : messages
    return { model, messages: allMessages, stream: true }
  },
  parseStream: (reader) => streamSSE(reader),
}
