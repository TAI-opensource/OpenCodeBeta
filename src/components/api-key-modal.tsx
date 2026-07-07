import { createSignal, Show } from "solid-js"
import { useConfig } from "../context/config"
import { getProviderIcon, type Provider } from "../lib/models-dev"

export function ApiKeyModal(props: {
  provider: Provider
  onClose: () => void
  onConnected: () => void
}) {
  const { addProvider, connectedProviders } = useConfig()
  const [key, setKey] = createSignal("")
  const [customUrl, setCustomUrl] = createSignal("")
  const [error, setError] = createSignal("")
  const [showKey, setShowKey] = createSignal(false)

  const alreadyConnected = connectedProviders().has(props.provider.id)
  const isCustom = props.provider.id === "custom"

  const getBaseUrl = (): string | null => {
    if (isCustom) return customUrl() || null
    return props.provider.api
  }

  const handleConnect = () => {
    setError("")
    if (!key().trim()) {
      setError("API key is required")
      return
    }
    if (isCustom && !customUrl().trim()) {
      setError("Base URL is required for custom providers")
      return
    }
    addProvider(props.provider.id, props.provider.name, key().trim(), getBaseUrl())
    props.onConnected()
  }

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={props.onClose}>
      <div
        class="w-full max-w-md bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">{getProviderIcon(props.provider.id)}</span>
          <div>
            <h3 class="text-lg font-semibold text-[var(--color-text)]">
              {alreadyConnected ? "Update" : "Connect"} {props.provider.name}
            </h3>
            <p class="text-xs text-[var(--color-text-muted)]">
              {Object.keys(props.provider.models).length} models available
            </p>
          </div>
        </div>

        <Show when={isCustom}>
          <div class="mb-4">
            <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Base URL
            </label>
            <input
              type="url"
              placeholder="https://api.example.com/v1/chat/completions"
              value={customUrl()}
              onInput={(e) => setCustomUrl(e.currentTarget.value)}
              class="w-full px-3 py-2 text-sm rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] font-mono"
            />
          </div>
        </Show>

        <div class="mb-4">
          <label class="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            API Key
          </label>
          <div class="relative">
            <input
              type={showKey() ? "text" : "password"}
              placeholder="sk-..."
              value={key()}
              onInput={(e) => setKey(e.currentTarget.value)}
              class="w-full px-3 py-2 pr-10 text-sm rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey())}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-[var(--color-text)] text-xs"
            >
              {showKey() ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <Show when={error()}>
          <p class="text-xs text-[var(--color-error)] mb-3">{error()}</p>
        </Show>

        <p class="text-[10px] text-[var(--color-text-dim)] mb-4">
          Your API key is stored locally in your browser. It is never sent to any server except {props.provider.name}.
        </p>

        <div class="flex gap-2">
          <button
            onClick={props.onClose}
            class="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            class="flex-1 px-4 py-2 text-sm rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors font-medium"
          >
            {alreadyConnected ? "Update" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  )
}
