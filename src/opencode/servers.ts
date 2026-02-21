import { Data, Effect, Context, Layer, Console } from "effect"
import { TailscaleHttpClient } from "../tailscale";

class AgentServerError extends Data.TaggedError("AgentServerError")<{}> { }

type AgentServerImpl = {
  getServer: (serverId: string) => Effect.Effect<string, AgentServerError>;
  getSessionsOnServer: (serverId: string) => Effect.Effect<string, AgentServerError>;
  getSession: (sessionId: string, serverId: string) => Effect.Effect<string, AgentServerError>
}
class AgentServer extends Context.Tag("oc-server-discovery/opencode/servers/AgentServer")<AgentServer, AgentServerImpl>() { }

const AgentServerLive = Layer.effect(
  AgentServer,
  Effect.gen(function*() {
    const tailscale = yield* TailscaleHttpClient
    const containers = yield* tailscale.listContainers
    yield* Console.log({ containers })
    // const servers = yield* Effect.tryPromise()


    return {
      getServer
    }
  })
)
