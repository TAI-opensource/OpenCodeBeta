import { createSignal, For, Show } from "solid-js"
import { useSessions } from "../context/sessions"
import { useConfig } from "../context/config"
import { getProviderIcon } from "../lib/models-dev"

export function Sidebar() {
  const { sessions, currentSession, selectSession, deleteSession, createSession } = useSessions()
  const { connectedProviders, theme, setTheme } = useConfig()
  const [confirmDelete, setConfirmDelete] = createSignal<string | null>(null)

  const handleNewSession = () => {
    const providers = connectedProviders()
    if (providers.size === 0) return
    const first = providers.keys().next().value!
    createSession(first, "")
  }

  return (
    <aside class="w-64 h-full flex flex-col bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] shrink-0">
      <div class="p-3 border-b border-[var(--color-border)]">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-sm font-semibold text-[var(--color-text)]">TAI Workspace</h1>
          <button
            onClick={() => setTheme(theme() === "dark" ? "light" : "dark")}
            class="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded"
            title="Toggle theme"
          >
            {theme() === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        <button
          onClick={handleNewSession}
          disabled={connectedProviders().size === 0}
          class="w-full px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
        <For each={sessions()}>
          {(session) => (
            <div
              class={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors ${
                currentSession()?.id === session.id
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
              }`}
              onClick={() => selectSession(session.id)}
            >
              <span class="shrink-0">{getProviderIcon(session.provider_id)}</span>
              <span class="flex-1 truncate">
                {session.title || "New Chat"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirmDelete() === session.id) {
                    deleteSession(session.id)
                    setConfirmDelete(null)
                  } else {
                    setConfirmDelete(session.id)
                    setTimeout(() => setConfirmDelete(null), 2000)
                  }
                }}
                class="opacity-0 group-hover:opacity-100 text-[var(--color-text-dim)] hover:text-[var(--color-error)] shrink-0"
                title={confirmDelete() === session.id ? "Click again to confirm" : "Delete"}
              >
                {confirmDelete() === session.id ? "✓" : "×"}
              </button>
            </div>
          )}
        </For>
        <Show when={sessions().length === 0}>
          <p class="text-[10px] text-[var(--color-text-dim)] text-center mt-4">
            No conversations yet
          </p>
        </Show>
      </div>

      <div class="p-2 border-t border-[var(--color-border)]">
        <p class="text-[10px] text-[var(--color-text-dim)] text-center">
          {connectedProviders().size} provider{connectedProviders().size !== 1 ? "s" : ""} connected
        </p>
      </div>
    </aside>
  )
}
