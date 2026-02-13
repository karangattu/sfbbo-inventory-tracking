import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(1),
  storageLocation: text("storage_location"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  eventDate: integer("event_date", { mode: "timestamp" }).notNull(),
  location: text("location"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("reserved"), // reserved, returned
  conditionNotes: text("condition_notes"),
  reservedAt: integer("reserved_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  returnedAt: integer("returned_at", { mode: "timestamp" }),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
