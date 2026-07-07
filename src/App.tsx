import { Suspense } from "solid-js"
import { DBProvider } from "./context/db"
import { ConfigProvider } from "./context/config"
import { SessionsProvider } from "./context/sessions"
import { App as AppInner } from "./components/app"
import "./styles/globals.css"

function Loading() {
  return (
    <div class="h-full flex items-center justify-center bg-[var(--color-bg)]">
      <div class="text-center">
        <div class="text-2xl mb-2">⚡</div>
        <p class="text-sm text-[var(--color-text-muted)]">Loading TAI Workspace...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <DBProvider>
        <ConfigProvider>
          <SessionsProvider>
            <AppInner />
          </SessionsProvider>
        </ConfigProvider>
      </DBProvider>
    </Suspense>
  )
}
