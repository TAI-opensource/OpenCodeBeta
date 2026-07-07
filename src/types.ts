export interface Provider {
  id: string
  name: string
  env: string[]
  npm: string
  api: string | null
  doc: string
  models: Record<string, Model>
}

export interface Model {
  id: string
  name: string
  description: string
  reasoning: boolean
  tool_call: boolean
  attachment: boolean
  limit: { context: number; output: number }
  cost?: { input: number; output: number }
  modalities: { input: string[]; output: string[] }
}

export interface DBProvider {
  id: string
  name: string
  api_key: string
  api_base: string | null
  connected_at: number
}

export interface Session {
  id: string
  title: string | null
  provider_id: string
  model_id: string
  created_at: number
  updated_at: number
}

export interface Message {
  id: string
  session_id: string
  role: "user" | "assistant" | "system"
  content: string
  model_id: string | null
  created_at: number
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface StreamOptions {
  model: string
  messages: ChatMessage[]
  signal?: AbortSignal
}

export interface AIProvider {
  id: string
  name: string
  baseUrl: string
  headers: (apiKey: string) => Record<string, string>
  formatBody: (messages: ChatMessage[], model: string, system?: string) => object
  parseStream: (reader: ReadableStreamDefaultReader<Uint8Array>) => AsyncIterable<string>
}
