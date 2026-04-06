import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { pgTable, serial, text as pgText, integer as pgInteger, boolean as pgBoolean, timestamp as pgTimestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Detect database mode ──────────────────────────────────────
const isPg = process.env.DATABASE_URL?.startsWith("postgres");

// ─── SQLite Schema (local development) ─────────────────────────
export const sqliteUsers = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password"),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id").unique(),
  plan: text("plan").notNull().default("free"),
  planExpiresAt: text("plan_expires_at"),
  createdAt: text("created_at").notNull(),
});

export const sqliteProfiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => sqliteUsers.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  headline: text("headline"),
  summary: text("summary"),
  skills: text("skills"),
  experience: text("experience"),
  education: text("education"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  preferredRoles: text("preferred_roles"),
  preferredLocations: text("preferred_locations"),
  minSalary: integer("min_salary"),
  remoteOnly: integer("remote_only", { mode: "boolean" }).default(false),
  techStack: text("tech_stack"),
});

export const sqliteJobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalId: text("external_id"),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  remote: integer("remote", { mode: "boolean" }).default(false),
  description: text("description"),
  requirements: text("requirements"),
  salary: text("salary"),
  url: text("url").notNull(),
  source: text("source").notNull(),
  datePosted: text("date_posted"),
  dateScraped: text("date_scraped").notNull(),
  matchScore: integer("match_score"),
  skillMatch: integer("skill_match"),
  seniorityFit: integer("seniority_fit"),
  status: text("status").notNull().default("new"),
});

export const sqliteApplications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").references(() => sqliteJobs.id),
  company: text("company").notNull(),
  role: text("role").notNull(),
  dateApplied: text("date_applied").notNull(),
  status: text("status").notNull().default("applied"),
  resumeVersion: text("resume_version"),
  coverLetter: text("cover_letter"),
  notes: text("notes"),
  source: text("source"),
  url: text("url"),
  salary: text("salary"),
  nextStep: text("next_step"),
  nextStepDate: text("next_step_date"),
  responseDate: text("response_date"),
});

export const sqliteSettings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const sqliteActivityLog = sqliteTable("activity_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"),
  timestamp: text("timestamp").notNull(),
});

// ─── PostgreSQL Schema (production) ────────────────────────────
export const pgUsers = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: pgText("password"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: pgText("avatar_url"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  planExpiresAt: pgText("plan_expires_at"),
  createdAt: pgText("created_at").notNull(),
});

export const pgProfiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: pgInteger("user_id").references(() => pgUsers.id),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  location: varchar("location", { length: 255 }),
  headline: pgText("headline"),
  summary: pgText("summary"),
  skills: pgText("skills"),
  experience: pgText("experience"),
  education: pgText("education"),
  linkedinUrl: pgText("linkedin_url"),
  githubUrl: pgText("github_url"),
  portfolioUrl: pgText("portfolio_url"),
  preferredRoles: pgText("preferred_roles"),
  preferredLocations: pgText("preferred_locations"),
  minSalary: pgInteger("min_salary"),
  remoteOnly: pgBoolean("remote_only").default(false),
  techStack: pgText("tech_stack"),
});

export const pgJobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 255 }),
  title: varchar("title", { length: 500 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  remote: pgBoolean("remote").default(false),
  description: pgText("description"),
  requirements: pgText("requirements"),
  salary: varchar("salary", { length: 100 }),
  url: pgText("url").notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  datePosted: pgText("date_posted"),
  dateScraped: pgText("date_scraped").notNull(),
  matchScore: pgInteger("match_score"),
  skillMatch: pgInteger("skill_match"),
  seniorityFit: pgInteger("seniority_fit"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
});

export const pgApplications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: pgInteger("job_id").references(() => pgJobs.id),
  company: varchar("company", { length: 255 }).notNull(),
  role: varchar("role", { length: 500 }).notNull(),
  dateApplied: pgText("date_applied").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("applied"),
  resumeVersion: pgText("resume_version"),
  coverLetter: pgText("cover_letter"),
  notes: pgText("notes"),
  source: varchar("source", { length: 100 }),
  url: pgText("url"),
  salary: varchar("salary", { length: 100 }),
  nextStep: pgText("next_step"),
  nextStepDate: pgText("next_step_date"),
  responseDate: pgText("response_date"),
});

export const pgSettings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: pgText("value").notNull(),
});

export const pgActivityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  description: pgText("description").notNull(),
  metadata: pgText("metadata"),
  timestamp: pgText("timestamp").notNull(),
});

// ─── Unified exports (switch by env) ───────────────────────────
export const users = isPg ? pgUsers : sqliteUsers;
export const profiles = isPg ? pgProfiles : sqliteProfiles;
export const jobs = isPg ? pgJobs : sqliteJobs;
export const applications = isPg ? pgApplications : sqliteApplications;
export const settings = isPg ? pgSettings : sqliteSettings;
export const activityLog = isPg ? pgActivityLog : sqliteActivityLog;

// ─── Insert schemas ────────────────────────────────────────────
export const insertUserSchema = createInsertSchema(sqliteUsers).omit({ id: true });
export const insertProfileSchema = createInsertSchema(sqliteProfiles).omit({ id: true });
export const insertJobSchema = createInsertSchema(sqliteJobs).omit({ id: true });
export const insertApplicationSchema = createInsertSchema(sqliteApplications).omit({ id: true });
export const insertSettingSchema = createInsertSchema(sqliteSettings).omit({ id: true });
export const insertActivityLogSchema = createInsertSchema(sqliteActivityLog).omit({ id: true });

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types (same shape regardless of DB)
export type User = typeof sqliteUsers.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof sqliteProfiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Job = typeof sqliteJobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof sqliteApplications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Setting = typeof sqliteSettings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type ActivityLogEntry = typeof sqliteActivityLog.$inferSelect;
export type InsertActivityLogEntry = z.infer<typeof insertActivityLogSchema>;
