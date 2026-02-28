import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 py-8">
      <div className="space-y-0">
        <div className="flex items-end justify-between px-4 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-muted/40 px-4 py-2">
            <Skeleton className="h-3 w-24" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-3">
              <Skeleton className="h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
