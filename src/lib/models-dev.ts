import type { Provider, Model } from "../types"

let cache: Record<string, Provider> | null = null

export async function fetchProviders(): Promise<Record<string, Provider>> {
  if (cache) return cache
  const res = await fetch("https://models.dev/api.json")
  if (!res.ok) throw new Error(`Failed to fetch models.dev: ${res.status}`)
  cache = await res.json()
  return cache!
}

export async function getProvider(id: string): Promise<Provider | null> {
  const providers = await fetchProviders()
  return providers[id] ?? null
}

export async function getModels(providerId: string): Promise<Model[]> {
  const provider = await getProvider(providerId)
  if (!provider) return []
  return Object.values(provider.models).filter(
    (m) => !m.modalities?.output?.some((o) => o !== "text")
  )
}

export async function searchProviders(query: string): Promise<Provider[]> {
  const providers = await fetchProviders()
  const q = query.toLowerCase()
  return Object.values(providers).filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
  )
}

const PROVIDER_ICONS: Record<string, string> = {
  openai: "🟢",
  anthropic: "🟤",
  google: "🔵",
  openrouter: "🟣",
  deepseek: "🔵",
  groq: "🟡",
  mistral: "🟠",
}

export function getProviderIcon(id: string): string {
  return PROVIDER_ICONS[id] ?? "⚪"
}

export function getModelName(model: Model): string {
  return model.name || model.id
}

export function formatCost(model: Model): string {
  if (!model.cost) return ""
  const input = model.cost.input.toFixed(2)
  const output = model.cost.output.toFixed(2)
  return `$${input}/$${output} per 1M tokens`
}

export function formatContext(limit: number): string {
  if (limit >= 1_000_000) return `${(limit / 1_000_000).toFixed(1)}M`
  if (limit >= 1_000) return `${(limit / 1_000).toFixed(0)}K`
  return limit.toString()
}
