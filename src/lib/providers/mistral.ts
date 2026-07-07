import { createOpenAIProvider } from "./base"

export const mistralProvider = createOpenAIProvider(
  "mistral",
  "Mistral",
  "https://api.mistral.ai/v1/chat/completions"
)
