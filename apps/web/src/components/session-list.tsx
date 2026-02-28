"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { SessionEntry } from "@/lib/oc-api"

type SessionListProps = {
  sessions: SessionEntry[]
  generatedAt: string
}

function StatusDot({ status }: { status: SessionEntry["containerStatus"] }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${status === "online"
          ? "bg-emerald-400 animate-pulse-dot"
          : "bg-amber-400"
        }`}
    />
  )
}

const OPENCODE_PORT = 4096

function getSessionUrl(session: SessionEntry) {
  const host = session.containerAddress || session.containerHostname
  if (!host || session.sessionId.startsWith("empty-") || session.sessionId.startsWith("err-")) {
    return null
  }

  const encodedPath = session.projectPath
    ? btoa(session.projectPath).replace(/=+$/, "")
    : null

  console.log({ encodedPath })
  if (!encodedPath) {
    return null
  }

  return `http://${host}:${OPENCODE_PORT}/${encodedPath}/session/${session.sessionId}`
}

function SessionRow({ session, index }: { session: SessionEntry; index: number }) {
  const staggerClass = index < 8 ? `stagger-${index + 1}` : "stagger-8"
  const sessionUrl = getSessionUrl(session)

  return (
    <div
      className={`animate-fade-up ${staggerClass} group flex items-center gap-4 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/60`}
    >
      <StatusDot status={session.containerStatus} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {session.sessionTitle}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
          {session.containerName}
          <span className="mx-1.5 text-border">|</span>
          {session.containerAddress || session.containerHostname}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {sessionUrl ? (
          <a href={sessionUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 font-mono text-xs text-muted-foreground hover:text-primary"
            >
              open
            </Button>
          </a>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-7 px-2.5 font-mono text-xs text-muted-foreground"
          >
            open
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-7 px-2.5 font-mono text-xs text-muted-foreground hover:text-primary"
        >
          ssh
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="h-7 px-2.5 font-mono text-xs text-muted-foreground hover:text-primary"
        >
          vscode
        </Button>
      </div>
    </div>
  )
}

export function SessionList({ sessions, generatedAt }: SessionListProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter(
      (s) =>
        s.sessionTitle.toLowerCase().includes(q) ||
        s.containerName.toLowerCase().includes(q) ||
        s.containerHostname.toLowerCase().includes(q),
    )
  }, [sessions, query])

  return (
    <div className="space-y-0">
      <header className="flex items-end justify-between gap-4 px-4 pb-4">
        <div>
          <h1 className="text-2xl tracking-tight">Sessions</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {sessions.length} active
            <span className="mx-1.5 text-border">|</span>
            refreshed {new Date(generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter sessions..."
            className="h-8 w-56 border-border bg-muted/50 font-mono text-xs placeholder:text-muted-foreground/60"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-border font-mono text-xs text-muted-foreground hover:text-foreground"
            onClick={() => window.location.reload()}
          >
            refresh
          </Button>
        </div>
      </header>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-4 border-b border-border bg-muted/40 px-4 py-2">
          <span className="w-2" />
          <span className="flex-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Session
          </span>
          <span className="w-[180px] text-right font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Actions
          </span>
        </div>

        {filtered.length > 0 ? (
          filtered.map((session, index) => (
            <SessionRow key={session.sessionId} session={session} index={index} />
          ))
        ) : (
          <div className="px-4 py-12 text-center font-mono text-sm text-muted-foreground">
            {query ? "No sessions match filter" : "No sessions found"}
          </div>
        )}
      </div>
    </div>
  )
}
