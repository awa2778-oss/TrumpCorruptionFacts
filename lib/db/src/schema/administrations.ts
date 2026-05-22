import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const administrationsTable = pgTable("administrations", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  president: text("president").notNull(),
  party: text("party").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  executiveOrders: integer("executive_orders").notNull().default(0),
  supremeCourtCases: integer("supreme_court_cases").notNull().default(0),
  supremeCourtWins: integer("supreme_court_wins").notNull().default(0),
  legislationSigned: integer("legislation_signed").notNull().default(0),
  description: text("description").notNull().default(""),
});

export const insertAdministrationSchema = createInsertSchema(administrationsTable).omit({ id: true });
export type InsertAdministration = z.infer<typeof insertAdministrationSchema>;
export type Administration = typeof administrationsTable.$inferSelect;
