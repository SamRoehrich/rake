export type SessionEntry = {
  sessionId: string
  sessionTitle: string
  containerId: string
  containerName: string
  containerHostname: string
  containerAddress: string
  containerStatus: "online" | "degraded"
  projectPath: string | null
}

type ContainerDevice = {
  id: string
  name: string
  hostname: string
  addresses: string[]
}

type ContainersResponse = {
  devices: ContainerDevice[]
}

type SessionRaw = {
  id: string
  title: string
  projectPath: string | null
}

const getApiBaseUrl = () => process.env.OC_API_BASE_URL ?? "http://localhost:8080"

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await response.text() || `Request failed: ${path}`)
  }

  return response.json() as Promise<T>
}

const parseSessions = (raw: unknown): SessionRaw[] => {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    if (typeof item.id !== "string" || typeof item.title !== "string") return []
    return [{
      id: item.id,
      title: item.title,
      projectPath: typeof item.projectPath === "string" ? item.projectPath : null,
    }]
  })
}

export const getSessions = async (): Promise<SessionEntry[]> => {
  const { devices: containers } = await fetchJson<ContainersResponse>("/containers")
  const results: SessionEntry[] = []

  await Promise.all(
    containers.map(async (container) => {
      const address = container.addresses[0] ?? ""
      try {
        const raw = await fetchJson<unknown>(`/server/${container.id}`)
        const sessions = parseSessions(raw)

        for (const session of sessions) {
          results.push({
            sessionId: session.id,
            sessionTitle: session.title,
            containerId: container.id,
            containerName: container.name,
            containerHostname: container.hostname,
            containerAddress: address,
            containerStatus: "online",
            projectPath: session.projectPath,
          })
        }

        if (sessions.length === 0) {
          results.push({
            sessionId: `empty-${container.id}`,
            sessionTitle: "No active session",
            containerId: container.id,
            containerName: container.name,
            containerHostname: container.hostname,
            containerAddress: address,
            containerStatus: "online",
            projectPath: null,
          })
        }
      } catch {
        results.push({
          sessionId: `err-${container.id}`,
          sessionTitle: "Session unavailable",
          containerId: container.id,
          containerName: container.name,
          containerHostname: container.hostname,
          containerAddress: address,
          containerStatus: "degraded",
          projectPath: null,
        })
      }
    }),
  )

  return results.sort((a, b) => a.containerName.localeCompare(b.containerName))
}
