import { Effect, Console, Layer, Schema } from 'effect'
import { serve, type BunRequest } from 'bun'
import { TailscaleHttpClient, TailscaleHttpClientLive } from './src/services/tailscale'
import { OpenCode, OpenCodeLive } from './src/services/opencode'
import { Container, CreateContainerOptions } from './src/services/container'
import { ContainerLive } from './src/services/container/providers/docker'
import { ConfigLive } from './src/services/config'

const program = Console.log('Hello, Effect')

Effect.runSync(program)

const AppLayer = OpenCodeLive.pipe(
  Layer.provide(TailscaleHttpClientLive)
)

const ContainerLayer = ContainerLive.pipe(
  Layer.provide(ConfigLive)
)

const runnableGetServer = (id: string) => Effect.gen(function*() {
  const opencode = yield* OpenCode
  const servers = yield* opencode.getAllSessions(id)
  return Response.json(servers)
}).pipe(Effect.provide(AppLayer))

const runnableCreateContainer = (req: BunRequest) => Effect.gen(function*() {
  const container = yield* Container
  const body = yield* Effect.tryPromise(() => req.json())
  const options = yield* Schema.decodeUnknown(CreateContainerOptions)(body).pipe(
    Effect.mapError((e) => new Response(`Invalid container options: ${e.message}`, { status: 400 }))
  )
  return yield* container.create(options).pipe(Effect.matchEffect({
    onSuccess: (c) => Effect.succeed(Response.json(c)),
    onFailure: (e) => Effect.succeed(Response.json({
      message: e.message,
      tag: e._tag,
      e: e.e
    }))
  }))
}).pipe(Effect.provide(ContainerLayer))

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
    '/container/create': { POST: (req) => Effect.runPromise(runnableCreateContainer(req)) },
    '/container/:id': (req) => Effect.runPromise(tailscaleGetContainerProgram(req.params.id)),
    '/server/:id': (req) => Effect.runPromise(runnableGetServer(req.params.id))
  },
})

