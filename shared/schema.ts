import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generations = pgTable("generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  inputImageUrl: text("input_image_url").notNull(),
  outputImageUrl: text("output_image_url"),
  model: text("model").notNull(),
  sampler: text("sampler").notNull(),
  cfgScale: real("cfg_scale").notNull(),
  steps: integer("steps").notNull(),
  denoiseStrength: real("denoise_strength").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: text("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  createdAt: true,
});

export const generationSettingsSchema = z.object({
  model: z.string(),
  sampler: z.string(),
  cfgScale: z.number().min(0).max(15),
  steps: z.number().min(1).max(50),
  denoiseStrength: z.number().min(0).max(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generations.$inferSelect;
export type GenerationSettings = z.infer<typeof generationSettingsSchema>;
