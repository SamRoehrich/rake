import { Context, Data, Effect } from "effect";

export class BashExecutionError extends Data.TaggedError("BashExecutionError")<{
  command: string
  exitCode: number
  stderr: string
  cause?: unknown
}> { }

export class BashSpawnError extends Data.TaggedError("BashSpawnError")<{
  command: string
  cause: unknown
}> { }

export interface BashResult {
  stdout: string
  stderr: string
  exitCode: number
}

type BashImpl = {
  run: (command: string) => Effect.Effect<BashResult, BashExecutionError | BashSpawnError>
}

export class Bash extends Context.Tag("oc-server-discovery/services/bash/index/Bash")<Bash, BashImpl>() { }
