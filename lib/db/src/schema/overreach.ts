import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const overreachIncidentsTable = pgTable("overreach_incidents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  administration: text("administration").notNull(),
  year: integer("year").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  outcome: text("outcome").notNull(),
  challenger: text("challenger").notNull(),
  significance: text("significance").notNull(),
  references: jsonb("references").notNull().default([]),
});

export const insertOverreachIncidentSchema = createInsertSchema(overreachIncidentsTable).omit({ id: true });
export type InsertOverreachIncident = z.infer<typeof insertOverreachIncidentSchema>;
export type OverreachIncident = typeof overreachIncidentsTable.$inferSelect;
