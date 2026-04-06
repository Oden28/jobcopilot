import {
  type User, type InsertUser, users,
  type Profile, type InsertProfile, profiles,
  type Job, type InsertJob, jobs,
  type Application, type InsertApplication, applications,
  type Setting, type InsertSetting, settings,
  type ActivityLogEntry, type InsertActivityLogEntry, activityLog,
  sqliteUsers, sqliteProfiles, sqliteJobs, sqliteApplications, sqliteSettings, sqliteActivityLog,
  pgUsers, pgProfiles, pgJobs, pgApplications, pgSettings, pgActivityLog,
} from "@shared/schema";
import { eq, desc, and, like, gte } from "drizzle-orm";

// ─── Database connection (auto-detect from env) ────────────────
const isPg = !!process.env.DATABASE_URL?.startsWith("postgres");

let db: any;

if (isPg) {
  // PostgreSQL (production)
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pg = await import("pg");
  const pool = new pg.default.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  db = drizzle(pool);
  console.log("Connected to PostgreSQL");
} else {
  // SQLite (local development)
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const Database = (await import("better-sqlite3")).default;
  const sqlite = new Database(process.env.SQLITE_PATH || "data.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  db = drizzle(sqlite);
  console.log("Connected to SQLite:", process.env.SQLITE_PATH || "data.db");
}

export { db };

// ─── Table references (resolved by env) ────────────────────────
const t = {
  users: isPg ? pgUsers : sqliteUsers,
  profiles: isPg ? pgProfiles : sqliteProfiles,
  jobs: isPg ? pgJobs : sqliteJobs,
  applications: isPg ? pgApplications : sqliteApplications,
  settings: isPg ? pgSettings : sqliteSettings,
  activityLog: isPg ? pgActivityLog : sqliteActivityLog,
} as any;

// ─── Storage interface ─────────────────────────────────────────
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getProfile(userId?: number): Promise<Profile | undefined>;
  upsertProfile(profile: InsertProfile): Promise<Profile>;
  getJobs(filters?: { source?: string; status?: string; minScore?: number; search?: string }): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJobStatus(id: number, status: string): Promise<Job | undefined>;
  getJobStats(): Promise<{ total: number; new: number; saved: number; applied: number; sources: Record<string, number> }>;
  getApplications(filters?: { status?: string }): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined>;
  getApplicationStats(): Promise<{ total: number; applied: number; screening: number; interview: number; offer: number; rejected: number; responseRate: number; interviewRate: number }>;
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
  getActivityLog(limit?: number): Promise<ActivityLogEntry[]>;
  logActivity(entry: InsertActivityLogEntry): Promise<ActivityLogEntry>;
}

// ─── Helpers for SQLite vs PG query differences ────────────────
function getOne(result: any): any {
  if (isPg) {
    // PG returns array from .returning()
    return Array.isArray(result) ? result[0] : result;
  }
  // SQLite .get() returns single row
  return result;
}

function getAll(result: any): any[] {
  if (isPg) return result;
  return result;
}

// ─── Implementation ────────────────────────────────────────────
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    if (isPg) {
      const rows = await db.select().from(t.users).where(eq(t.users.id, id));
      return rows[0];
    }
    return db.select().from(t.users).where(eq(t.users.id, id)).get();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (isPg) {
      const rows = await db.select().from(t.users).where(eq(t.users.email, email));
      return rows[0];
    }
    return db.select().from(t.users).where(eq(t.users.email, email)).get();
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    if (isPg) {
      const rows = await db.select().from(t.users).where(eq(t.users.googleId, googleId));
      return rows[0];
    }
    return db.select().from(t.users).where(eq(t.users.googleId, googleId)).get();
  }

  async createUser(user: InsertUser): Promise<User> {
    if (isPg) {
      const rows = await db.insert(t.users).values(user).returning();
      return rows[0];
    }
    return db.insert(t.users).values(user).returning().get();
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    if (isPg) {
      const rows = await db.update(t.users).set(updates).where(eq(t.users.id, id)).returning();
      return rows[0];
    }
    return db.update(t.users).set(updates).where(eq(t.users.id, id)).returning().get();
  }

  // Profile
  async getProfile(userId?: number): Promise<Profile | undefined> {
    if (isPg) {
      const rows = userId
        ? await db.select().from(t.profiles).where(eq(t.profiles.userId, userId))
        : await db.select().from(t.profiles).limit(1);
      return rows[0];
    }
    if (userId) return db.select().from(t.profiles).where(eq(t.profiles.userId, userId)).get();
    return db.select().from(t.profiles).get();
  }

  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    const existing = profile.userId
      ? await this.getProfile(profile.userId)
      : await this.getProfile();
    if (existing) {
      if (isPg) {
        const rows = await db.update(t.profiles).set(profile).where(eq(t.profiles.id, existing.id)).returning();
        return rows[0];
      }
      return db.update(t.profiles).set(profile).where(eq(t.profiles.id, existing.id)).returning().get()!;
    }
    if (isPg) {
      const rows = await db.insert(t.profiles).values(profile).returning();
      return rows[0];
    }
    return db.insert(t.profiles).values(profile).returning().get();
  }

  // Jobs
  async getJobs(filters?: { source?: string; status?: string; minScore?: number; search?: string }): Promise<Job[]> {
    const conditions = [];
    if (filters?.source) conditions.push(eq(t.jobs.source, filters.source));
    if (filters?.status) conditions.push(eq(t.jobs.status, filters.status));
    if (filters?.minScore) conditions.push(gte(t.jobs.matchScore, filters.minScore));
    if (filters?.search) conditions.push(like(t.jobs.title, `%${filters.search}%`));

    if (conditions.length > 0) {
      return db.select().from(t.jobs).where(and(...conditions)).orderBy(desc(t.jobs.matchScore)).all?.() ??
        await db.select().from(t.jobs).where(and(...conditions)).orderBy(desc(t.jobs.matchScore));
    }
    return db.select().from(t.jobs).orderBy(desc(t.jobs.matchScore)).all?.() ??
      await db.select().from(t.jobs).orderBy(desc(t.jobs.matchScore));
  }

  async getJob(id: number): Promise<Job | undefined> {
    if (isPg) {
      const rows = await db.select().from(t.jobs).where(eq(t.jobs.id, id));
      return rows[0];
    }
    return db.select().from(t.jobs).where(eq(t.jobs.id, id)).get();
  }

  async createJob(job: InsertJob): Promise<Job> {
    if (isPg) {
      const rows = await db.insert(t.jobs).values(job).returning();
      return rows[0];
    }
    return db.insert(t.jobs).values(job).returning().get();
  }

  async updateJobStatus(id: number, status: string): Promise<Job | undefined> {
    if (isPg) {
      const rows = await db.update(t.jobs).set({ status }).where(eq(t.jobs.id, id)).returning();
      return rows[0];
    }
    return db.update(t.jobs).set({ status }).where(eq(t.jobs.id, id)).returning().get();
  }

  async getJobStats() {
    const allJobs = await this.getJobs();
    const sources: Record<string, number> = {};
    let newCount = 0, savedCount = 0, appliedCount = 0;
    for (const job of allJobs) {
      sources[job.source] = (sources[job.source] || 0) + 1;
      if (job.status === "new") newCount++;
      if (job.status === "saved") savedCount++;
      if (job.status === "applied") appliedCount++;
    }
    return { total: allJobs.length, new: newCount, saved: savedCount, applied: appliedCount, sources };
  }

  // Applications
  async getApplications(filters?: { status?: string }): Promise<Application[]> {
    if (filters?.status) {
      if (isPg) return db.select().from(t.applications).where(eq(t.applications.status, filters.status)).orderBy(desc(t.applications.dateApplied));
      return db.select().from(t.applications).where(eq(t.applications.status, filters.status)).orderBy(desc(t.applications.dateApplied)).all();
    }
    if (isPg) return db.select().from(t.applications).orderBy(desc(t.applications.dateApplied));
    return db.select().from(t.applications).orderBy(desc(t.applications.dateApplied)).all();
  }

  async getApplication(id: number): Promise<Application | undefined> {
    if (isPg) {
      const rows = await db.select().from(t.applications).where(eq(t.applications.id, id));
      return rows[0];
    }
    return db.select().from(t.applications).where(eq(t.applications.id, id)).get();
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    if (isPg) {
      const rows = await db.insert(t.applications).values(app).returning();
      return rows[0];
    }
    return db.insert(t.applications).values(app).returning().get();
  }

  async updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application | undefined> {
    if (isPg) {
      const rows = await db.update(t.applications).set(updates).where(eq(t.applications.id, id)).returning();
      return rows[0];
    }
    return db.update(t.applications).set(updates).where(eq(t.applications.id, id)).returning().get();
  }

  async getApplicationStats() {
    const allApps = await this.getApplications();
    let applied = 0, screening = 0, interview = 0, offer = 0, rejected = 0;
    for (const app of allApps) {
      switch (app.status) {
        case "applied": applied++; break;
        case "screening": screening++; break;
        case "interview": interview++; break;
        case "offer": offer++; break;
        case "rejected": rejected++; break;
      }
    }
    const total = allApps.length;
    const responded = screening + interview + offer + rejected;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;
    return { total, applied, screening, interview, offer, rejected, responseRate, interviewRate };
  }

  // Settings
  async getSetting(key: string): Promise<string | undefined> {
    if (isPg) {
      const rows = await db.select().from(t.settings).where(eq(t.settings.key, key));
      return rows[0]?.value;
    }
    const row = db.select().from(t.settings).where(eq(t.settings.key, key)).get();
    return row?.value;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (existing !== undefined) {
      if (isPg) {
        const rows = await db.update(t.settings).set({ value }).where(eq(t.settings.key, key)).returning();
        return rows[0];
      }
      return db.update(t.settings).set({ value }).where(eq(t.settings.key, key)).returning().get()!;
    }
    if (isPg) {
      const rows = await db.insert(t.settings).values({ key, value }).returning();
      return rows[0];
    }
    return db.insert(t.settings).values({ key, value }).returning().get();
  }

  async getAllSettings(): Promise<Setting[]> {
    if (isPg) return db.select().from(t.settings);
    return db.select().from(t.settings).all();
  }

  // Activity Log
  async getActivityLog(limit = 50): Promise<ActivityLogEntry[]> {
    if (isPg) return db.select().from(t.activityLog).orderBy(desc(t.activityLog.timestamp)).limit(limit);
    return db.select().from(t.activityLog).orderBy(desc(t.activityLog.timestamp)).limit(limit).all();
  }

  async logActivity(entry: InsertActivityLogEntry): Promise<ActivityLogEntry> {
    if (isPg) {
      const rows = await db.insert(t.activityLog).values(entry).returning();
      return rows[0];
    }
    return db.insert(t.activityLog).values(entry).returning().get();
  }
}

export const storage = new DatabaseStorage();
