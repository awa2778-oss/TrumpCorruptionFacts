import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supremeCourtCasesTable = pgTable("supreme_court_cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  outcome: text("outcome").notNull(),
  description: text("description").notNull(),
  administration: text("administration").notNull(),
  significance: text("significance").notNull(),
  category: text("category").notNull(),
  references: jsonb("references").notNull().default([]),
});

export const insertSupremeCourtCaseSchema = createInsertSchema(supremeCourtCasesTable).omit({ id: true });
export type InsertSupremeCourtCase = z.infer<typeof insertSupremeCourtCaseSchema>;
export type SupremeCourtCase = typeof supremeCourtCasesTable.$inferSelect;
