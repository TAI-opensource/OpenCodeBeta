import type { AIProvider } from "../../types"
import { createOpenAIProvider } from "./base"

export function createCustomProvider(name: string, baseUrl: string): AIProvider {
  return createOpenAIProvider("custom", name, baseUrl)
}
