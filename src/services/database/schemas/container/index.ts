import { createInsertSchema, createSelectSchema } from "drizzle-orm/effect-schema"
import { pgTable, integer, varchar } from "drizzle-orm/pg-core"

export const containers = pgTable("containers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  hostname: varchar({ length: 255 }).notNull(),
  ip: varchar({ length: 255 }).notNull(),
  creatorUserId: varchar('user_id', { length: 255 }).notNull()
})

export const ContainerInsert = createInsertSchema(containers)
export const ContainerSelect = createSelectSchema(containers)
