import { pgTable, serial, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assetTypeEnum = pgEnum("asset_type", ["crypto", "stock", "commodity"]);

export const assetsTable = pgTable("assets", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  assetType: assetTypeEnum("asset_type").notNull(),
  currentPrice: numeric("current_price", { precision: 18, scale: 8 }).notNull(),
  change24h: numeric("change_24h", { precision: 18, scale: 8 }).default("0").notNull(),
  changePercent24h: numeric("change_percent_24h", { precision: 10, scale: 4 }).default("0").notNull(),
  high24h: numeric("high_24h", { precision: 18, scale: 8 }),
  low24h: numeric("low_24h", { precision: 18, scale: 8 }),
  volume24h: numeric("volume_24h", { precision: 24, scale: 2 }),
  marketCap: numeric("market_cap", { precision: 24, scale: 2 }),
  description: text("description"),
  exchange: text("exchange"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAssetSchema = createInsertSchema(assetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;
