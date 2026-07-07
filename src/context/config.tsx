import { createContext, useContext, createSignal, createEffect, type JSX } from "solid-js"
import { query, run, persist } from "../lib/db"
import type { DBProvider } from "../types"

interface ConfigContextType {
  providers: () => DBProvider[]
  connectedProviders: () => Map<string, DBProvider>
  addProvider: (id: string, name: string, apiKey: string, apiBase?: string) => void
  removeProvider: (id: string) => void
  getApiKey: (id: string) => string | null
  theme: () => "dark" | "light"
  setTheme: (t: "dark" | "light") => void
}

const ConfigContext = createContext<ConfigContextType>()

export function ConfigProvider(props: { children: JSX.Element }) {
  const [providers, setProviders] = createSignal<DBProvider[]>([])
  const savedTheme = (localStorage.getItem("tai-theme") as "dark" | "light") || "dark"
  const [theme, setThemeSignal] = createSignal<"dark" | "light">(savedTheme)

  const refresh = () => {
    const rows = query<DBProvider>("SELECT * FROM providers ORDER BY connected_at DESC")
    setProviders(rows)
  }

  createEffect(() => {
    if (providers().length >= 0) {
      document.documentElement.classList.toggle("dark", theme() === "dark")
      document.documentElement.classList.toggle("light", theme() === "light")
    }
  })

  const connectedProviders = () => {
    const map = new Map<string, DBProvider>()
    for (const p of providers()) map.set(p.id, p)
    return map
  }

  const addProvider = (id: string, name: string, apiKey: string, apiBase?: string) => {
    run(
      "INSERT OR REPLACE INTO providers (id, name, api_key, api_base, connected_at) VALUES (?, ?, ?, ?, ?)",
      [id, name, apiKey, apiBase ?? null, Date.now()]
    )
    persist()
    refresh()
  }

  const removeProvider = (id: string) => {
    run("DELETE FROM providers WHERE id = ?", [id])
    persist()
    refresh()
  }

  const getApiKey = (id: string): string | null => {
    const row = queryOne<{ api_key: string }>("SELECT api_key FROM providers WHERE id = ?", [id])
    return row?.api_key ?? null
  }

  const setTheme = (t: "dark" | "light") => {
    setThemeSignal(t)
    localStorage.setItem("tai-theme", t)
  }

  return (
    <ConfigContext.Provider
      value={{
        providers,
        connectedProviders,
        addProvider,
        removeProvider,
        getApiKey,
        theme,
        setTheme,
      }}
    >
      {props.children}
    </ConfigContext.Provider>
  )
}

function queryOne<T = Record<string, any>>(sql: string, params: any[] = []): T | null {
  const rows = query<T>(sql, params)
  return rows[0] ?? null
}

export function useConfig() {
  return useContext(ConfigContext)!
}
