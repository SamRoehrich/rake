import { env } from 'bun'
import { Context, Data, Effect, Layer } from 'effect'

export class ConfigError extends Data.TaggedError("ConfigError")<{}> { }

type ConfigImpl = {
  readonly get: (key: string) => Effect.Effect<string, ConfigError, never>
}

export class Config extends Context.Tag("oc-server-discovery/services/config")<Config, ConfigImpl>() { }

export const ConfigLive = Layer.succeed(Config, {
  get: (key: string) => Effect.fromNullable(env[key]).pipe(Effect.mapError(() => new ConfigError()))
})

