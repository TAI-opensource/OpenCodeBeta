import { createSignal, onMount, onCleanup } from "solid-js"

export function ThinkingIndicator() {
  const [dots, setDots] = createSignal(".")

  onMount(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."))
    }, 400)
    onCleanup(() => clearInterval(interval))
  })

  return (
    <div class="flex gap-3 py-4 px-4">
      <div class="w-7 h-7 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
        <span class="text-xs">🤖</span>
      </div>
      <div class="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
        <div class="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <div class="flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-bounce" style="animation-delay: 300ms" />
          </div>
          <span class="text-xs">Thinking{dots()}</span>
        </div>
      </div>
    </div>
  )
}
