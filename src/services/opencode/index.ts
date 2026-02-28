import { Data, Effect, Context, Layer } from "effect"
import { TailscaleHttpClient } from "../tailscale";
import { createOpencodeClient, type Session } from "@opencode-ai/sdk";

class OpenCodeSDKError extends Data.TaggedError("AgentServerError")<{
  message: string,
  cause: unknown,
  containerId: string
}> { }

export type SessionWithProject = Session & {
  projectPath: string | null
}

type OpenCodeImpl = {
  getAllSessions: (containerId: string) => Effect.Effect<SessionWithProject[], OpenCodeSDKError>;
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
          return sessions.data
        },
        catch: (e) => new OpenCodeSDKError({
          message: "Failed to get sessions",
          cause: e,
          containerId
        })
      });
      const projectPaths = yield* Effect.tryPromise({
        try: async () => {
          const result = await client.project.list()
          const projects = result.data ?? []
          const map = new Map<string, string>()
          for (const project of projects) {
            if (project.id && project.worktree) {
              map.set(project.id, project.worktree)
            }
          }
          return map
        },
        catch: () => new OpenCodeSDKError({
          message: "Failed to list projects",
          cause: null,
          containerId
        })
      }).pipe(Effect.catchAll(() => Effect.succeed(new Map<string, string>())));
      return sessions.map((session) => ({
        ...session,
        projectPath: projectPaths.get(session.projectID) ?? null,
      }))
    })
    return {
      getAllSessions
    }
  })
)
