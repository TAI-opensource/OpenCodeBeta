import { createSignal, onCleanup } from "solid-js"

export function PromptInput(props: {
  onSend: (text: string) => void
  onStop: () => void
  disabled: boolean
}) {
  const [text, setText] = createSignal("")
  let textareaRef!: HTMLTextAreaElement

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (text().trim() && !props.disabled) {
        props.onSend(text())
        setText("")
        if (textareaRef) {
          textareaRef.style.height = "auto"
        }
      }
    }
  }

  const handleInput = () => {
    if (textareaRef) {
      textareaRef.style.height = "auto"
      textareaRef.style.height = Math.min(textareaRef.scrollHeight, 200) + "px"
    }
  }

  return (
    <div class="p-4">
      <div class="relative flex items-end gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2 focus-within:border-[var(--color-accent)] transition-colors">
        <textarea
          ref={textareaRef}
          value={text()}
          onInput={(e) => {
            setText(e.currentTarget.value)
            handleInput()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          disabled={props.disabled}
          rows={1}
          class="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-dim)] focus:outline-none px-2 py-1.5 max-h-[200px] disabled:opacity-50"
        />
        <div class="flex items-center gap-1">
          {props.disabled ? (
            <button
              onClick={props.onStop}
              class="p-2 rounded-xl bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/80 transition-colors"
              title="Stop generating"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => {
                if (text().trim()) {
                  props.onSend(text())
                  setText("")
                  if (textareaRef) textareaRef.style.height = "auto"
                }
              }}
              disabled={!text().trim()}
              class="p-2 rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p class="text-[10px] text-[var(--color-text-dim)] text-center mt-2">
        AI responses may be inaccurate. Verify important information.
      </p>
    </div>
  )
}
