import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const loginSessionsTable = pgTable("login_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  deviceInfo: text("device_info").notNull().default("Unknown device"),
  browser: text("browser").notNull().default("Unknown"),
  os: text("os").notNull().default("Unknown"),
  ipAddress: text("ip_address").notNull().default("Unknown"),
  location: text("location").notNull().default("Unknown"),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LoginSession = typeof loginSessionsTable.$inferSelect;
