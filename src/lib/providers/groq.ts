import { createOpenAIProvider } from "./base"

export const groqProvider = createOpenAIProvider(
  "groq",
  "Groq",
  "https://api.groq.com/openai/v1/chat/completions"
)
