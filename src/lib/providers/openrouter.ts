import { createOpenAIProvider } from "./base"

export const openrouterProvider = createOpenAIProvider(
  "openrouter",
  "OpenRouter",
  "https://openrouter.ai/api/v1/chat/completions"
)
