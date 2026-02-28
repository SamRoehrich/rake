import { SessionList } from "@/components/session-list"
import { AnalyticsGrid } from "@/components/analytics-grid"
import { getSessions } from "@/lib/oc-api"

export default async function HomePage() {
  const result = await getSessions()
    .then((sessions) => ({ ok: true as const, sessions }))
    .catch((error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown error",
    }))

  if (!result.ok) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-lg border border-destructive/40 bg-card p-6">
          <h1 className="text-lg text-destructive">Failed to load sessions</h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">{result.error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 py-8">
      <SessionList sessions={result.sessions} generatedAt={new Date().toISOString()} />
      <AnalyticsGrid />
    </main>
  )
}
