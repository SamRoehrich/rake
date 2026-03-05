import { defineRelations } from "drizzle-orm";
import { containers } from './container'
import { users } from "./user";

export const relations = defineRelations({ containers, users }, (r) => ({
  containers: {
    creator: r.one.users({
      from: r.containers.userId,
      to: r.users.id
    })
  }
}))
