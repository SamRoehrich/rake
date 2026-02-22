import { Effect, Console } from 'effect'
import { serve } from 'bun'
import { TailscaleHttpClient, TailscaleHttpClientLive } from './src/tailscale'
import { OpenCode, OpenCodeLive } from './src/opencode'

const program = Console.log('Hello, Effect')

Effect.runSync(program)

const runnableGetServer = (id: string) => Effect.gen(function*() {
  const opencode = yield* OpenCode
  const servers = yield* opencode.getAllSessions(id)
  return Response.json(servers)
}).pipe(Effect.provide(OpenCodeLive), Effect.provide(TailscaleHttpClientLive))

const tailscaleListContainersProgram = Effect.gen(function*() {
  const tailscale = yield* TailscaleHttpClient
  const containers = yield* tailscale.listContainers
  return Response.json(containers)
}).pipe(Effect.provide(TailscaleHttpClientLive))

const tailscaleGetContainerProgram = (id: string) => Effect.gen(function*() {
  const tailscale = yield* TailscaleHttpClient
  const container = yield* tailscale.getContainer(id)
  return Response.json(container)
}).pipe(Effect.provide(TailscaleHttpClientLive))

serve({
  port: 8080,
  routes: {
    '/containers': () => Effect.runPromise(tailscaleListContainersProgram),
    '/container/:id': (req) => Effect.runPromise(tailscaleGetContainerProgram(req.params.id)),
    '/server/:id': (req) => Effect.runPromise(runnableGetServer(req.params.id))
  },
})

