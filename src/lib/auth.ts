import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// We have to create our own DB instance for auth and one for Effect. This is not ideal
// but is the pattern we are taking because I want to use Effect for the business logic
// and I am not so worried about duplicate DB clients. If this becomes a problem in the
// future I'll address it.
import { drizzle } from "drizzle-orm/bun-sql";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("Database URL missing")

const authDb = drizzle(dbUrl)

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  database: drizzleAdapter(authDb, {
    provider: "pg",
  }),
});
