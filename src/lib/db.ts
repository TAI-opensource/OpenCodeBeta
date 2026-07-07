import initSqlJs, { type Database } from "sql.js"

let db: Database | null = null
const DB_NAME = "tai-workspace"
const STORE_NAME = "sqlite-db"
const DB_KEY = "main"

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveToIDB(data: Uint8Array) {
  const idb = await openIDB()
  return new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(data, DB_KEY)
    tx.oncomplete = () => { idb.close(); resolve() }
    tx.onerror = () => { idb.close(); reject(tx.error) }
  })
}

async function loadFromIDB(): Promise<Uint8Array | null> {
  const idb = await openIDB()
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(DB_KEY)
    req.onsuccess = () => { idb.close(); resolve(req.result ?? null) }
    req.onerror = () => { idb.close(); reject(req.error) }
  })
}

export async function initDB(): Promise<Database> {
  if (db) return db
  const SQL = await initSqlJs({
    locateFile: (file) => `/wa-sqlite/${file}`,
  })

  const saved = await loadFromIDB()
  db = saved ? new SQL.Database(saved) : new SQL.Database()

  db.run(`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      api_key TEXT NOT NULL,
      api_base TEXT,
      connected_at INTEGER NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT,
      provider_id TEXT NOT NULL,
      model_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (provider_id) REFERENCES providers(id)
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model_id TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    )
  `)
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC)`)

  await persist()
  return db
}

export async function persist() {
  if (!db) return
  const data = db.export()
  await saveToIDB(new Uint8Array(data))
}

export function getDB(): Database {
  if (!db) throw new Error("Database not initialized")
  return db
}

export function run(sql: string, params: any[] = []) {
  const d = getDB()
  d.run(sql, params)
}

export function query<T = Record<string, any>>(sql: string, params: any[] = []): T[] {
  const d = getDB()
  const stmt = d.prepare(sql)
  if (params.length) stmt.bind(params)
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

export function queryOne<T = Record<string, any>>(sql: string, params: any[] = []): T | null {
  const rows = query<T>(sql, params)
  return rows[0] ?? null
}
