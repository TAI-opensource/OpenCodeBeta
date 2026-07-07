import { type JSX, Show } from "solid-js"
import { Sidebar } from "./sidebar"

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="flex h-full w-full bg-[var(--color-bg)]">
      <Sidebar />
      <main class="flex-1 flex flex-col h-full overflow-hidden">
        {props.children}
      </main>
    </div>
  )
}
