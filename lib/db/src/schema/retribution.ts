import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const retributionActionsTable = pgTable("retribution_actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  target: text("target").notNull(),
  targetType: text("target_type").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  outcome: text("outcome").notNull(),
  judicialResponse: text("judicial_response"),
  significance: text("significance").notNull(),
  trumpConnection: text("trump_connection"),
  connectionType: text("connection_type"),
  relationshipYears: integer("relationship_years"),
  references: jsonb("references").notNull().default([]),
});

export const insertRetributionActionSchema = createInsertSchema(retributionActionsTable).omit({ id: true });
export type InsertRetributionAction = z.infer<typeof insertRetributionActionSchema>;
export type RetributionAction = typeof retributionActionsTable.$inferSelect;
