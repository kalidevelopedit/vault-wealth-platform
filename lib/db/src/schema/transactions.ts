import { pgTable, serial, integer, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["buy", "sell", "deposit", "withdraw", "convert"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  symbol: text("symbol"),
  name: text("name"),
  quantity: numeric("quantity", { precision: 18, scale: 8 }),
  price: numeric("price", { precision: 18, scale: 8 }),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  fromSymbol: text("from_symbol"),
  toSymbol: text("to_symbol"),
  status: transactionStatusEnum("status").default("completed").notNull(),
  logoUrl: text("logo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
