import { createSignal, Show } from "solid-js"
import { useSessions } from "../context/sessions"
import { Layout } from "./layout"
import { Welcome } from "./welcome"
import { Chat } from "./chat"

export function App() {
  const { currentSession } = useSessions()

  return (
    <Layout>
      <Show when={currentSession()} fallback={<Welcome />}>
        <Chat />
      </Show>
    </Layout>
  )
}
