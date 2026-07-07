import { createEffect, createSignal, Show } from "solid-js"
import type { Message as MessageType } from "../types"
import { useConfig } from "../context/config"
import { getProviderIcon } from "../lib/models-dev"

export function Message(props: { message: MessageType }) {
  const { connectedProviders } = useConfig()
  const [rendered, setRendered] = createSignal("")
  const isUser = props.message.role === "user"
  const isAssistant = props.message.role === "assistant"

  createEffect(() => {
    const content = props.message.content
    if (!content) {
      setRendered("")
      return
    }
    renderMarkdown(content).then(setRendered)
  })

  return (
    <div class={`flex gap-3 py-4 px-4 ${isUser ? "justify-end" : ""}`}>
      <Show when={isAssistant}>
        <div class="w-7 h-7 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
          <span class="text-xs">🤖</span>
        </div>
      </Show>

      <div
        class={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-surface)] border border-[var(--color-border)]"
        }`}
      >
        <Show when={isAssistant && props.message.model_id}>
          <div class="text-[10px] text-[var(--color-text-dim)] mb-1">
            {connectedProviders().get(props.message.model_id!)?.name || props.message.model_id}
          </div>
        </Show>
        <div
          class={`markdown-body text-sm ${isUser ? "text-white" : "text-[var(--color-text)]"}`}
          innerHTML={rendered()}
        />
      </div>

      <Show when={isUser}>
        <div class="w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0 mt-0.5">
          <span class="text-xs">👤</span>
        </div>
      </Show>
    </div>
  )
}

async function renderMarkdown(content: string): Promise<string> {
  try {
    const { marked } = await import("marked")
    const { createShikiHighlighter } = await import("shiki")

    const highlighter = await createShikiHighlighter({
      themes: ["github-dark"],
      langs: ["javascript", "typescript", "python", "bash", "json", "html", "css", "rust", "go"],
    })

    marked.setOptions({
      highlight: (code: string, lang: string) => {
        try {
          return highlighter.codeToHtml(code, { lang: lang || "text", theme: "github-dark" })
        } catch {
          return `<pre><code>${escapeHtml(code)}</code></pre>`
        }
      },
      breaks: true,
      gfm: true,
    })

    return await marked.parse(content)
  } catch {
    return `<p>${escapeHtml(content)}</p>`
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
