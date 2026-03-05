import { createInsertSchema, createSelectSchema } from "drizzle-orm/effect-schema"
import { pgTable, integer, varchar } from "drizzle-orm/pg-core"

export const containers = pgTable("containers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  hostname: varchar({ length: 255 }).notNull(),
  ip: varchar({ length: 255 }).notNull(),
  userId: integer('user_id')
})

export const ContainerInsert = createInsertSchema(containers)
export const ContainerSelect = createSelectSchema(containers)
