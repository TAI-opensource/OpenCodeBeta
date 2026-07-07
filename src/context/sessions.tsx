import { createContext, useContext, createSignal, type JSX } from "solid-js"
import { query, run, persist } from "../lib/db"
import type { Session, Message } from "../types"

interface SessionsContextType {
  sessions: () => Session[]
  currentSession: () => Session | null
  messages: () => Message[]
  refresh: () => void
  createSession: (providerId: string, modelId: string) => string
  selectSession: (id: string) => void
  deleteSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  addMessage: (sessionId: string, role: "user" | "assistant" | "system", content: string, modelId?: string) => void
  streaming: () => boolean
  setStreaming: (v: boolean) => void
  abortController: () => AbortController | null
  setAbortController: (c: AbortController | null) => void
}

const SessionsContext = createContext<SessionsContextType>()

export function SessionsProvider(props: { children: JSX.Element }) {
  const [sessions, setSessions] = createSignal<Session[]>([])
  const [currentSession, setCurrentSession] = createSignal<Session | null>(null)
  const [messages, setMessages] = createSignal<Message[]>([])
  const [streaming, setStreaming] = createSignal(false)
  const [abortController, setAbortController] = createSignal<AbortController | null>(null)

  const refresh = () => {
    const rows = query<Session>("SELECT * FROM sessions ORDER BY updated_at DESC")
    setSessions(rows)
    if (currentSession()) {
      const updated = rows.find((s) => s.id === currentSession()!.id)
      if (updated) setCurrentSession(updated)
    }
  }

  const loadMessages = (sessionId: string) => {
    const rows = query<Message>(
      "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC",
      [sessionId]
    )
    setMessages(rows)
  }

  const createSession = (providerId: string, modelId: string): string => {
    const id = crypto.randomUUID()
    const now = Date.now()
    run(
      "INSERT INTO sessions (id, title, provider_id, model_id, created_at, updated_at) VALUES (?, NULL, ?, ?, ?, ?)",
      [id, providerId, modelId, now, now]
    )
    persist()
    refresh()
    selectSession(id)
    return id
  }

  const selectSession = (id: string) => {
    const session = query<Session>("SELECT * FROM sessions WHERE id = ?", [id])[0]
    if (session) {
      setCurrentSession(session)
      loadMessages(id)
    }
  }

  const deleteSession = (id: string) => {
    run("DELETE FROM messages WHERE session_id = ?", [id])
    run("DELETE FROM sessions WHERE id = ?", [id])
    if (currentSession()?.id === id) {
      setCurrentSession(null)
      setMessages([])
    }
    persist()
    refresh()
  }

  const renameSession = (id: string, title: string) => {
    run("UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?", [title, Date.now(), id])
    persist()
    refresh()
  }

  const addMessage = (
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    modelId?: string
  ) => {
    const id = crypto.randomUUID()
    const now = Date.now()
    run(
      "INSERT INTO messages (id, session_id, role, content, model_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, sessionId, role, content, modelId ?? null, now]
    )
    run("UPDATE sessions SET updated_at = ? WHERE id = ?", [now, sessionId])

    if (currentSession()?.id === sessionId) {
      loadMessages(sessionId)
    }
    persist()
    refresh()
  }

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        currentSession,
        messages,
        refresh,
        createSession,
        selectSession,
        deleteSession,
        renameSession,
        addMessage,
        streaming,
        setStreaming,
        abortController,
        setAbortController,
      }}
    >
      {props.children}
    </SessionsContext.Provider>
  )
}

export function useSessions() {
  return useContext(SessionsContext)!
}
