import { createSignal, createEffect, Show, For } from "solid-js"
import { useSessions } from "../context/sessions"
import { useConfig } from "../context/config"
import { Message } from "./message"
import { PromptInput } from "./prompt-input"
import { ModelSelector } from "./model-selector"
import { ThinkingIndicator } from "./thinking-indicator"
import { getProvider } from "../lib/providers/registry"
import { getSystemPrompt } from "../lib/system-prompts"
import { run, persist } from "../lib/db"

export function Chat() {
  const { currentSession, messages, addMessage, streaming, setStreaming, abortController, setAbortController, refresh } = useSessions()
  const { getApiKey } = useConfig()
  const [model, setModel] = createSignal("")
  let scrollRef!: HTMLDivElement

  createEffect(() => {
    const session = currentSession()
    if (session && !model()) {
      setModel(session.model_id)
    }
  })

  createEffect(() => {
    messages()
    setTimeout(() => {
      if (scrollRef) {
        scrollRef.scrollTop = scrollRef.scrollHeight
      }
    }, 0)
  })

  const updateLastAssistantMessage = (sessionId: string, content: string, modelId: string) => {
    const msgs = messages()
    const last = msgs[msgs.length - 1]
    if (last && last.role === "assistant" && last.model_id === modelId) {
      run("UPDATE messages SET content = ? WHERE id = ?", [content, last.id])
      persist()
      refresh()
    } else {
      addMessage(sessionId, "assistant", content, modelId)
    }
  }

  const handleSend = async (content: string) => {
    const session = currentSession()
    if (!session || !content.trim() || streaming()) return

    const providerId = session.provider_id
    const modelId = model() || session.model_id
    if (!modelId) return

    const apiKey = getApiKey(providerId)
    if (!apiKey) return

    addMessage(session.id, "user", content.trim())

    const provider = getProvider(providerId)
    if (!provider) return

    const allMessages = [
      ...messages().map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: content.trim() },
    ]

    const systemPrompt = getSystemPrompt(modelId)
    const body = provider.formatBody(allMessages, modelId, systemPrompt)
    const headers = provider.headers(apiKey)

    const controller = new AbortController()
    setAbortController(controller)
    setStreaming(true)

    let assistantContent = ""

    try {
      const res = await fetch(provider.baseUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.text()
        assistantContent = `Error: ${res.status} - ${err}`
      } else {
        const reader = res.body!.getReader()
        for await (const chunk of provider.parseStream(reader)) {
          assistantContent += chunk
          updateLastAssistantMessage(session.id, assistantContent, modelId)
        }
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        if (!assistantContent) {
          assistantContent = "*Generation stopped*"
        }
      } else {
        assistantContent = `Error: ${e.message}`
      }
    } finally {
      if (assistantContent && !messages().some((m) => m.content === assistantContent && m.role === "assistant")) {
        addMessage(session.id, "assistant", assistantContent, modelId)
      }
      setStreaming(false)
      setAbortController(null)
    }
  }

  const handleStop = () => {
    abortController()?.abort()
  }

  return (
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <div class="px-4 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-[var(--color-text)]">
            {currentSession()?.title || "New Chat"}
          </span>
        </div>
        <ModelSelector
          providerId={currentSession()?.provider_id || ""}
          value={model()}
          onChange={setModel}
        />
      </div>

      <div ref={scrollRef} class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto py-4">
          {messages().map((msg) => (
            <Message message={msg} />
          ))}
          <Show when={streaming()}>
            <ThinkingIndicator />
          </Show>
        </div>
      </div>

      <div class="border-t border-[var(--color-border)]">
        <div class="max-w-3xl mx-auto">
          <PromptInput
            onSend={handleSend}
            onStop={handleStop}
            disabled={streaming()}
          />
        </div>
      </div>
    </div>
  )
}
