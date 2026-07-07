import { createSignal, onMount, Show } from "solid-js"
import { useConfig } from "../context/config"
import { useSessions } from "../context/sessions"
import { fetchProviders, getProviderIcon, type Provider } from "../lib/models-dev"
import { ApiKeyModal } from "./api-key-modal"

export function Welcome() {
  const { connectedProviders, removeProvider } = useConfig()
  const { createSession } = useSessions()
  const [providers, setProviders] = createSignal<Provider[]>([])
  const [loading, setLoading] = createSignal(true)
  const [selectedProvider, setSelectedProvider] = createSignal<Provider | null>(null)
  const [search, setSearch] = createSignal("")

  onMount(async () => {
    try {
      const data = await fetchProviders()
      const priority = ["openai", "anthropic", "google", "openrouter", "deepseek", "groq", "mistral"]
      const sorted = Object.values(data).sort((a, b) => {
        const ai = priority.indexOf(a.id)
        const bi = priority.indexOf(b.id)
        return (ai === -1 ? 100 : ai) - (bi === -1 ? 100 : bi)
      })
      setProviders(sorted)
    } catch (e) {
      console.error("Failed to fetch providers:", e)
    } finally {
      setLoading(false)
    }
  })

  const filtered = () => {
    const q = search().toLowerCase()
    if (!q) return providers()
    return providers().filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    )
  }

  const handleConnect = (provider: Provider) => {
    setSelectedProvider(provider)
  }

  const handleConnected = () => {
    setSelectedProvider(null)
  }

  return (
    <div class="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div class="w-full max-w-2xl">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-[var(--color-text)] mb-2">Welcome to TAI Workspace</h2>
          <p class="text-sm text-[var(--color-text-muted)]">
            Connect a provider to get started
          </p>
        </div>

        <div class="mb-6">
          <input
            type="text"
            placeholder="Search providers..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            class="w-full px-4 py-2 text-sm rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        <Show when={!loading()}>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered().map((provider) => {
              const connected = connectedProviders().has(provider.id)
              return (
                <button
                  onClick={() => handleConnect(provider)}
                  class={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    connected
                      ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5 hover:bg-[var(--color-success)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)]"
                  }`}
                >
                  <span class="text-2xl">{getProviderIcon(provider.id)}</span>
                  <span class="text-sm font-medium text-[var(--color-text)]">{provider.name}</span>
                  <span class="text-[10px] text-[var(--color-text-dim)]">
                    {Object.keys(provider.models).length} models
                  </span>
                  <Show when={connected}>
                    <span class="absolute top-2 right-2 text-[var(--color-success)] text-xs">✓</span>
                  </Show>
                </button>
              )
            })}
          </div>
        </Show>

        <Show when={loading()}>
          <div class="text-center py-8">
            <p class="text-sm text-[var(--color-text-muted)]">Loading providers...</p>
          </div>
        </Show>

        <Show when={connectedProviders().size > 0}>
          <div class="mt-8 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 class="text-sm font-medium text-[var(--color-text)] mb-3">Connected Providers</h3>
            <div class="space-y-2">
              {Array.from(connectedProviders().entries()).map(([id, provider]) => (
                <div class="flex items-center justify-between py-1">
                  <div class="flex items-center gap-2">
                    <span>{getProviderIcon(id)}</span>
                    <span class="text-sm text-[var(--color-text)]">{provider.name}</span>
                  </div>
                  <button
                    onClick={() => removeProvider(id)}
                    class="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-error)] transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Show>
      </div>

      <Show when={selectedProvider()}>
        <ApiKeyModal
          provider={selectedProvider()!}
          onClose={() => setSelectedProvider(null)}
          onConnected={handleConnected}
        />
      </Show>
    </div>
  )
}
