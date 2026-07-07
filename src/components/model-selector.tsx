import { createSignal, For, Show, onMount, createEffect } from "solid-js"
import { useConfig } from "../context/config"
import { getProviderIcon, formatContext, formatCost, type Model } from "../lib/models-dev"

export function ModelSelector(props: {
  providerId: string
  value: string
  onChange: (modelId: string) => void
}) {
  const { connectedProviders } = useConfig()
  const [models, setModels] = createSignal<Model[]>([])
  const [loading, setLoading] = createSignal(true)
  const [open, setOpen] = createSignal(false)

  onMount(async () => {
    try {
      const { getModels } = await import("../lib/models-dev")
      const data = await getModels(props.providerId)
      setModels(data)
    } catch (e) {
      console.error("Failed to load models:", e)
    } finally {
      setLoading(false)
    }
  })

  const selected = () => models().find((m) => m.id === props.value)

  return (
    <div class="relative">
      <button
        onClick={() => setOpen(!open())}
        class="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors min-w-[180px]"
      >
        <span>{getProviderIcon(props.providerId)}</span>
        <span class="flex-1 text-left truncate">
          {selected()?.name || props.value || "Select model"}
        </span>
        <span class="text-[var(--color-text-dim)]">▾</span>
      </button>

      <Show when={open()}>
        <div class="absolute bottom-full left-0 mb-1 w-80 max-h-64 overflow-y-auto bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-xl z-50">
          <Show when={!loading()}>
            <For each={models()}>
              {(model) => (
                <button
                  onClick={() => {
                    props.onChange(model.id)
                    setOpen(false)
                  }}
                  class={`w-full text-left px-3 py-2 text-xs hover:bg-[var(--color-bg-hover)] transition-colors ${
                    model.id === props.value ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" : ""
                  }`}
                >
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-[var(--color-text)]">{model.name}</span>
                    <div class="flex items-center gap-2">
                      {model.reasoning && (
                        <span class="text-[9px] px-1 py-0.5 rounded bg-[var(--color-warning)]/20 text-[var(--color-warning)]">reasoning</span>
                      )}
                      {model.tool_call && (
                        <span class="text-[9px] px-1 py-0.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)]">tools</span>
                      )}
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mt-0.5 text-[10px] text-[var(--color-text-dim)]">
                    <span>ctx: {formatContext(model.limit.context)}</span>
                    <span>out: {formatContext(model.limit.output)}</span>
                    {model.cost && <span>{formatCost(model)}</span>}
                  </div>
                </button>
              )}
            </For>
          </Show>
          <Show when={loading()}>
            <div class="p-3 text-xs text-[var(--color-text-muted)]">Loading models...</div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
