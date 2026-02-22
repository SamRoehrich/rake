import { Data, Effect, Context, Layer } from "effect"
import { TailscaleHttpClient } from "../tailscale";
import { createOpencodeClient, type Session } from "@opencode-ai/sdk";

class OpenCodeSDKError extends Data.TaggedError("AgentServerError")<{
  message: string,
  cause: unknown,
  containerId: string
}> { }

type OpenCodeImpl = {
  getAllSessions: (containerId: string) => Effect.Effect<Session[], OpenCodeSDKError>;
}
export class OpenCode extends Context.Tag("oc-server-discovery/opencode/index/OpenCode")<OpenCode, OpenCodeImpl>() { }

export const OpenCodeLive = Layer.effect(
  OpenCode,
  Effect.gen(function*() {
    const tailscale = yield* TailscaleHttpClient
    const getAllSessions = (containerId: string) => Effect.gen(function*() {
      const container = yield* tailscale.getContainer(containerId).pipe(Effect.catchTag("TailscaleHttpClientError", (e) => new OpenCodeSDKError({
        message: "Failed to get tailscale container",
        cause: e,
        containerId
      })));
      const client = createOpencodeClient({
        baseUrl: `http://${container.name}:4096`
      });
      const sessions = yield* Effect.tryPromise({
        try: async () => {
          const sessions = await client.session.list()
          if (sessions.error) {
            throw new Error(`OpenCode SDK error: ${sessions.error}`)
          }
          if (!sessions?.data?.length) {
            throw new Error("No sessions in container")
          }
          return sessions
        },
        catch: (e) => new OpenCodeSDKError({
          message: "Failed to get sessions",
          cause: e,
          containerId
        })
      });
      return sessions.data
    })
    return {
      getAllSessions
    }
  })
)
