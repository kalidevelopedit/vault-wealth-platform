import { pgTable, serial, text, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["not_started", "pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  legalName: text("legal_name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  profilePhotoUrl: text("profile_photo_url"),
  role: roleEnum("role").default("user").notNull(),
  kycStatus: kycStatusEnum("kyc_status").default("not_started").notNull(),
  kycNotes: text("kyc_notes"),
  onboardingStep: integer("onboarding_step").default(0).notNull(),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  investmentPreferences: text("investment_preferences").array(),
  investmentPurpose: text("investment_purpose"),
  investmentAmount: text("investment_amount"),
  selfieStatus: text("selfie_status").default("not_submitted").notNull(),
  selfieVideoUrl: text("selfie_video_url"),
  pinHash: text("pin_hash"),
  mustSetPin: boolean("must_set_pin").default(false).notNull(),
  availableCash: text("available_cash").default("10000.00").notNull(),
  isFrozen: boolean("is_frozen").default(false).notNull(),
  frozenReason: text("frozen_reason"),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
