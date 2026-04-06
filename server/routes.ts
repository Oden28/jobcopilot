import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertJobSchema, insertApplicationSchema, signupSchema, loginSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

// Session user type
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "jobcopilot-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  // ── Auth Routes ──
  app.post("/api/auth/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });

    const { email, password, fullName } = parsed.data;

    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      fullName,
      plan: "free",
      createdAt: new Date().toISOString(),
    });

    req.session.userId = user.id;
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });

    const { email, password } = parsed.data;

    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    req.session.userId = user.id;
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/auth/google", async (req, res) => {
    const { email, fullName, googleId, avatarUrl } = req.body;
    if (!email || !googleId) return res.status(400).json({ error: "Missing Google credentials" });

    let user = await storage.getUserByGoogleId(googleId);
    if (!user) {
      user = await storage.getUserByEmail(email);
      if (user) {
        // Link Google to existing account
        user = await storage.updateUser(user.id, { googleId, avatarUrl });
      } else {
        user = await storage.createUser({
          email,
          fullName: fullName || email.split("@")[0],
          googleId,
          avatarUrl,
          plan: "free",
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (!user) return res.status(500).json({ error: "Failed to create user" });

    req.session.userId = user.id;
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.json(null);
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.json(null);
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // ── Profile ──
  app.get("/api/profile", async (req, res) => {
    const profile = await storage.getProfile(req.session.userId);
    res.json(profile || null);
  });

  app.post("/api/profile", async (req, res) => {
    const parsed = insertProfileSchema.safeParse({ ...req.body, userId: req.session.userId });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const profile = await storage.upsertProfile(parsed.data);
    res.json(profile);
  });

  // ── Jobs ──
  app.get("/api/jobs", async (req, res) => {
    const { source, status, minScore, search } = req.query;
    const jobs = await storage.getJobs({
      source: source as string | undefined,
      status: status as string | undefined,
      minScore: minScore ? parseInt(minScore as string) : undefined,
      search: search as string | undefined,
    });
    res.json(jobs);
  });

  app.get("/api/jobs/stats", async (_req, res) => {
    res.json(await storage.getJobStats());
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(parseInt(req.params.id));
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  });

  app.post("/api/jobs", async (req, res) => {
    const parsed = insertJobSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createJob(parsed.data));
  });

  app.patch("/api/jobs/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });
    const job = await storage.updateJobStatus(parseInt(req.params.id), status);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  });

  // ── Applications ──
  app.get("/api/applications", async (req, res) => {
    res.json(await storage.getApplications({ status: req.query.status as string | undefined }));
  });

  app.get("/api/applications/stats", async (_req, res) => {
    res.json(await storage.getApplicationStats());
  });

  app.get("/api/applications/:id", async (req, res) => {
    const app_ = await storage.getApplication(parseInt(req.params.id));
    if (!app_) return res.status(404).json({ error: "Application not found" });
    res.json(app_);
  });

  app.post("/api/applications", async (req, res) => {
    const parsed = insertApplicationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const application = await storage.createApplication(parsed.data);
    await storage.logActivity({
      action: "applied",
      description: `Applied to ${parsed.data.role} at ${parsed.data.company}`,
      metadata: JSON.stringify({ applicationId: application.id }),
      timestamp: new Date().toISOString(),
    });
    res.json(application);
  });

  app.patch("/api/applications/:id", async (req, res) => {
    const application = await storage.updateApplication(parseInt(req.params.id), req.body);
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  });

  // ── Settings ──
  app.get("/api/settings", async (_req, res) => {
    const allSettings = await storage.getAllSettings();
    const settingsMap: Record<string, string> = {};
    allSettings.forEach(s => { settingsMap[s.key] = s.value; });
    res.json(settingsMap);
  });

  app.post("/api/settings", async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: "Key and value required" });
    res.json(await storage.setSetting(key, value));
  });

  // ── Activity Log ──
  app.get("/api/activity", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    res.json(await storage.getActivityLog(limit));
  });

  // ── Seed demo data ──
  app.post("/api/seed", async (_req, res) => {
    const existingJobs = await storage.getJobs();
    if (existingJobs.length > 0) return res.json({ message: "Data already seeded" });

    const demoJobs = [
      { title: "Senior AI Engineer", company: "DeepMind", location: "London, UK", remote: true, description: "Build next-gen AI models for production systems. Work on cutting-edge ML research applied to real products.", requirements: JSON.stringify(["Python", "PyTorch", "ML Systems", "5+ years"]), salary: "$180k - $250k", url: "https://deepmind.com/careers", source: "linkedin", datePosted: "2026-04-01", dateScraped: new Date().toISOString(), matchScore: 95, skillMatch: 92, seniorityFit: 90, status: "new" },
      { title: "Full Stack Engineer", company: "Vercel", location: "Remote", remote: true, description: "Build the platform that powers the modern web. Work on Next.js, Turbopack, and the Vercel platform.", requirements: JSON.stringify(["TypeScript", "React", "Node.js", "3+ years"]), salary: "$160k - $220k", url: "https://vercel.com/careers", source: "wellfound", datePosted: "2026-04-02", dateScraped: new Date().toISOString(), matchScore: 88, skillMatch: 95, seniorityFit: 85, status: "new" },
      { title: "ML Platform Engineer", company: "Anthropic", location: "San Francisco, CA", remote: false, description: "Design and build ML training infrastructure. Scale up model training from billions to trillions of parameters.", requirements: JSON.stringify(["Python", "Kubernetes", "Distributed Systems", "ML Infra"]), salary: "$200k - $300k", url: "https://anthropic.com/careers", source: "linkedin", datePosted: "2026-03-28", dateScraped: new Date().toISOString(), matchScore: 91, skillMatch: 88, seniorityFit: 85, status: "saved" },
      { title: "Software Engineer, Backend", company: "Stripe", location: "Remote", remote: true, description: "Build the infrastructure that powers the internet economy. Scale payment processing for millions of businesses.", requirements: JSON.stringify(["Ruby", "Go", "Distributed Systems", "APIs"]), salary: "$170k - $240k", url: "https://stripe.com/jobs", source: "indeed", datePosted: "2026-04-03", dateScraped: new Date().toISOString(), matchScore: 82, skillMatch: 78, seniorityFit: 88, status: "new" },
      { title: "React Native Developer", company: "Shopify", location: "Ottawa, Canada", remote: true, description: "Build mobile commerce experiences used by millions of merchants. Shape the future of mobile shopping.", requirements: JSON.stringify(["React Native", "TypeScript", "iOS", "Android"]), salary: "$140k - $190k", url: "https://shopify.com/careers", source: "glassdoor", datePosted: "2026-03-30", dateScraped: new Date().toISOString(), matchScore: 75, skillMatch: 80, seniorityFit: 72, status: "new" },
      { title: "DevOps / SRE Engineer", company: "Datadog", location: "New York, NY", remote: true, description: "Build and maintain the observability platform used by thousands of engineering teams worldwide.", requirements: JSON.stringify(["Kubernetes", "Terraform", "AWS", "Go", "Python"]), salary: "$155k - $210k", url: "https://datadog.com/careers", source: "remoteok", datePosted: "2026-04-04", dateScraped: new Date().toISOString(), matchScore: 70, skillMatch: 65, seniorityFit: 78, status: "new" },
      { title: "Frontend Engineer", company: "Figma", location: "San Francisco, CA", remote: false, description: "Build the collaborative design tool used by millions. Push the boundaries of browser-based graphics.", requirements: JSON.stringify(["TypeScript", "React", "WebGL", "Performance"]), salary: "$165k - $230k", url: "https://figma.com/careers", source: "linkedin", datePosted: "2026-04-01", dateScraped: new Date().toISOString(), matchScore: 84, skillMatch: 86, seniorityFit: 80, status: "saved" },
      { title: "Data Engineer", company: "Databricks", location: "Remote", remote: true, description: "Build the lakehouse platform powering data engineering at scale. Work on Apache Spark and Delta Lake.", requirements: JSON.stringify(["Python", "Spark", "SQL", "Data Pipelines"]), salary: "$150k - $200k", url: "https://databricks.com/careers", source: "indeed", datePosted: "2026-03-29", dateScraped: new Date().toISOString(), matchScore: 68, skillMatch: 72, seniorityFit: 65, status: "new" },
    ];
    for (const job of demoJobs) await storage.createJob(job);

    const demoApps = [
      { company: "OpenAI", role: "Software Engineer, API Platform", dateApplied: "2026-03-15", status: "interview", source: "linkedin", url: "https://openai.com/careers", salary: "$200k - $280k", notes: "Phone screen completed. Technical round scheduled for April 10.", nextStep: "Technical Interview", nextStepDate: "2026-04-10", responseDate: "2026-03-20" },
      { company: "Google", role: "Senior SWE, Cloud AI", dateApplied: "2026-03-10", status: "screening", source: "careers page", url: "https://careers.google.com", salary: "$190k - $260k", notes: "Application reviewed. Waiting for recruiter call.", nextStep: "Recruiter Screen", nextStepDate: "2026-04-08" },
      { company: "Meta", role: "ML Engineer, AI Research", dateApplied: "2026-03-08", status: "rejected", source: "linkedin", url: "https://metacareers.com", salary: "$180k - $250k", notes: "Rejected after technical screen.", responseDate: "2026-03-22" },
      { company: "Netflix", role: "Senior Software Engineer", dateApplied: "2026-03-20", status: "applied", source: "indeed", url: "https://jobs.netflix.com", salary: "$250k - $350k", notes: "Applied through referral." },
      { company: "Spotify", role: "Backend Engineer, Content Platform", dateApplied: "2026-03-25", status: "applied", source: "glassdoor", url: "https://lifeatspotify.com", salary: "$160k - $200k" },
      { company: "Coinbase", role: "Senior Full Stack Engineer", dateApplied: "2026-02-28", status: "offer", source: "wellfound", url: "https://coinbase.com/careers", salary: "$190k - $240k", notes: "Offer received: $210k base + equity.", nextStep: "Offer Decision", nextStepDate: "2026-04-15", responseDate: "2026-03-28" },
      { company: "Notion", role: "Software Engineer, Editor", dateApplied: "2026-03-12", status: "interview", source: "careers page", url: "https://notion.so/careers", salary: "$170k - $220k", notes: "System design round completed.", nextStep: "On-site Interview", nextStepDate: "2026-04-12", responseDate: "2026-03-18" },
    ];
    for (const app of demoApps) await storage.createApplication(app);

    await storage.logActivity({ action: "system", description: "Demo data seeded successfully", timestamp: new Date().toISOString() });
    res.json({ message: "Demo data seeded" });
  });

  return httpServer;
}
