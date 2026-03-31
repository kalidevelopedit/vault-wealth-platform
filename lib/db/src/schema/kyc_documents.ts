import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "rejected"]);

export const kycDocumentsTable = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  side: text("side").notNull(),
  fileUrl: text("file_url").notNull(),
  status: documentStatusEnum("status").default("pending").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertKycDocumentSchema = createInsertSchema(kycDocumentsTable).omit({ id: true, uploadedAt: true });
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocumentsTable.$inferSelect;
