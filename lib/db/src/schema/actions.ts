import { pgTable, text, serial, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const actionsTable = pgTable("administration_actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  administration: text("administration").notNull(),
  status: text("status").notNull(),
  significance: text("significance"),
  references: jsonb("references").notNull().default([]),
  supremeCourtChallenged: boolean("supreme_court_challenged").default(false),
  factualityRating: text("factuality_rating"),
  factualitySource: text("factuality_source"),
  factualityNotes: text("factuality_notes"),
});

export const insertActionSchema = createInsertSchema(actionsTable).omit({ id: true });
export type InsertAction = z.infer<typeof insertActionSchema>;
export type AdministrationAction = typeof actionsTable.$inferSelect;
