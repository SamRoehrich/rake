const slots = Array.from({ length: 16 }, (_, i) => i + 1)

export function AnalyticsGrid() {
  return (
    <div className="space-y-0 px-4">
      <div className="flex items-end justify-between pb-3">
        <h2 className="text-lg tracking-tight">Analytics</h2>
        <p className="font-mono text-xs text-muted-foreground">4 x 4 embed grid</p>
      </div>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {slots.map((slot) => (
          <div key={slot} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-muted/40 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              slot-{String(slot).padStart(2, "0")}
            </div>
            <iframe
              title={`Analytics ${slot}`}
              srcDoc="<html><body style='margin:0;background:#111113;color:#52525b;font-family:ui-monospace,monospace;display:grid;place-items:center;height:100vh;font-size:11px;'>awaiting embed</body></html>"
              className="h-28 w-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
