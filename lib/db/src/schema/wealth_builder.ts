import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const wealthBuilderInvestmentsTable = pgTable("wealth_builder_investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  level: text("level").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  apyPercent: numeric("apy_percent", { precision: 6, scale: 2 }).notNull(),
  expectedReturn: numeric("expected_return", { precision: 18, scale: 2 }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  maturesAt: timestamp("matures_at").notNull(),
  status: text("status").default("active").notNull(),
  withdrawnAt: timestamp("withdrawn_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WealthBuilderInvestment = typeof wealthBuilderInvestmentsTable.$inferSelect;
