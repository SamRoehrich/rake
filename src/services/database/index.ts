import * as PgDrizzle from "drizzle-orm/effect-postgres"
import * as schema from './schemas'
import { Context, Effect, Layer } from "effect"

export const db = PgDrizzle.make({ schema }).pipe(
  Effect.provide(PgDrizzle.DefaultServices)
)

type Db = Effect.Effect.Success<typeof db>

export class DB extends Context.Tag("oc-server-discovery/services/database/index/DB")<DB, Db>() { }

export const DbLive = Layer.effect(DB, db)
