import type { AIProvider } from "../../types"
import { openaiProvider } from "./openai"
import { anthropicProvider } from "./anthropic"
import { googleProvider } from "./google"
import { openrouterProvider } from "./openrouter"
import { deepseekProvider } from "./deepseek"
import { groqProvider } from "./groq"
import { mistralProvider } from "./mistral"
import { createCustomProvider } from "./custom"

const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  openrouter: openrouterProvider,
  deepseek: deepseekProvider,
  groq: groqProvider,
  mistral: mistralProvider,
}

export function getProvider(id: string): AIProvider | null {
  return providers[id] ?? null
}

export function getOrCreateCustomProvider(
  name: string,
  baseUrl: string
): AIProvider {
  if (!providers.custom || providers.custom.baseUrl !== baseUrl) {
    providers.custom = createCustomProvider(name, baseUrl)
  }
  return providers.custom
}

export function listProviders(): AIProvider[] {
  return Object.values(providers)
}
