import { defineRelations } from "drizzle-orm";
import { containers } from './container'
import { user } from "./auth-schema";

export const relations = defineRelations({ containers, user }, (r) => ({
  containers: {
    creator: r.one.user({
      from: r.containers.creatorUserId,
      to: r.user.id
    })
  }
}))
