import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  source: text("source").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;
