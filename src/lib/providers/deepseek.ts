import { createOpenAIProvider } from "./base"

export const deepseekProvider = createOpenAIProvider(
  "deepseek",
  "DeepSeek",
  "https://api.deepseek.com/v1/chat/completions"
)
