import { createContext, useContext, createSignal, onMount, type JSX } from "solid-js"
import { initDB, type Database } from "../lib/db"

interface DBContextType {
  db: Database | null
  ready: boolean
}

const DBContext = createContext<DBContextType>({ db: null, ready: false })

export function DBProvider(props: { children: JSX.Element }) {
  const [db, setDb] = createSignal<Database | null>(null)
  const [ready, setReady] = createSignal(false)

  onMount(async () => {
    const database = await initDB()
    setDb(database)
    setReady(true)
  })

  return (
    <DBContext.Provider value={{ db, ready }}>
      {props.children}
    </DBContext.Provider>
  )
}

export function useDB() {
  return useContext(DBContext)
}
