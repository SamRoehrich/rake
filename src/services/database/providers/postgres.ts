import * as PgDrizzle from 'drizzle-orm/effect-postgres';
import { PgClient } from '@effect/sql-pg';
import * as Effect from 'effect/Effect';
import * as Redacted from 'effect/Redacted';
import { sql } from 'drizzle-orm';
import { types } from 'pg';

const PgClientLive = PgClient.layer({
  url: Redacted.make(process.env.DATABASE_URL!),
  types: {
    getTypeParser: (typeId, format) => {
      if ([1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)) {
        return (val: any) => val;
      }
      return types.getTypeParser(typeId, format);
    },
  },
});

const program = Effect.gen(function*() {
  const db = yield* PgDrizzle.makeWithDefaults();
  const result = yield* db.execute<{ id: number }>(sql`SELECT 1 as id`);
  console.log(result);
});
// Run the program with the PgClient layer
export const runnablePg = Effect.runPromise(program.pipe(Effect.provide(PgClientLive)));

