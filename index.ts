import { Effect, Console } from 'effect'
import { serve } from 'bun'
import { TailscaleHttpClient, TailscaleHttpClientLive } from './src/tailscale'

const program = Console.log('Hello, Effect')

Effect.runSync(program)

// const runnableGetServers = getServers.pipe(Effect.provide(ConfigLive))
// const runnableGetServer = (req: BunRequest) => getServer(req).pipe(Effect.provide(ConfigLive))
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
    // CONTAINERS
    '/containers': () => Effect.runPromise(tailscaleListContainersProgram),
    '/container/:id': (req) => Effect.runPromise(tailscaleGetContainerProgram(req.params.id)),

    // OPENCODE Servers
    // '/servers': () => Effect.runPromise(runnableGetServers),
    // '/server/:id': (req) => Effect.runPromise(runnableGetServer(req))
  },
})

