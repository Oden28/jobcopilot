# JobCopilot — AI Job Application Engine

An AI-powered autonomous job application system with smart matching, auto-apply, and application tracking.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend:** Express.js + better-sqlite3 + Drizzle ORM
- **Auth:** Session-based (bcryptjs) + Google OAuth ready
- **Build:** Vite + esbuild

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Push the database schema
npx drizzle-kit push

# 3. Start the dev server (frontend + backend on port 5000)
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## First Run

1. You'll land on the **login/signup page**
2. Create an account with email + password (or use Google sign-in)
3. The app auto-seeds demo data (8 jobs, 7 applications) on first dashboard load
4. Explore the Dashboard, Discover Jobs, Applications, Profile, and Settings pages

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   │   ├── ui/         # shadcn/ui primitives
│   │   │   ├── app-sidebar.tsx
│   │   │   └── theme-provider.tsx
│   │   ├── lib/
│   │   │   ├── auth.tsx    # Auth context + hooks
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── auth.tsx         # Login / Signup
│   │   │   ├── pricing.tsx      # Subscription plans
│   │   │   ├── dashboard.tsx    # Analytics dashboard
│   │   │   ├── jobs.tsx         # Job discovery
│   │   │   ├── applications.tsx # Application tracker
│   │   │   ├── profile.tsx      # CV / resume management
│   │   │   └── settings.tsx     # Automation preferences
│   │   ├── App.tsx
│   │   ├── index.css       # Tailwind + custom theme
│   │   └── main.tsx
│   └── index.html
├── server/
│   ├── index.ts            # Express entry point
│   ├── routes.ts           # API routes (auth, CRUD, seed)
│   ├── storage.ts          # Database layer (Drizzle + SQLite)
│   ├── vite.ts             # Vite dev middleware
│   └── static.ts           # Static file serving
├── shared/
│   └── schema.ts           # Drizzle schema + Zod validators
├── drizzle.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Key Features

- **Auth:** Email/password + Google OAuth, session management, protected routes
- **Dashboard:** KPI cards, pipeline chart, jobs-by-source bar chart, upcoming steps
- **Job Discovery:** Match scores, skill/seniority bars, search + filters, save/hide
- **Applications:** Expandable rows, status updates, notes, add new dialog
- **Profile:** Two-column layout, editable CV data, skills/experience preview
- **Settings:** Auto-apply toggle, confidence threshold, scan interval, AI provider, safety controls
- **Pricing:** 3-tier subscription model (Starter $19/mo, Pro $39/mo, Enterprise $99/mo)
- **Dark mode:** Full theme support with system preference detection

## Environment Variables (Production)

```env
SESSION_SECRET=your-secret-key-here
# For real Google OAuth:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Docker

```bash
# Option 1: Docker Compose (recommended)
docker compose up -d

# Option 2: Build and run manually
docker build -t jobcopilot .
docker run -d -p 5000:5000 \
  -e SESSION_SECRET=$(openssl rand -hex 32) \
  -v jobcopilot-data:/app/data \
  --name jobcopilot \
  jobcopilot
```

The app is available at `http://localhost:5000`. SQLite data persists in the `jobcopilot-data` volume.

To stop: `docker compose down` (data is preserved). To wipe data: `docker compose down -v`.

## Build for Production (without Docker)

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## License

Private — All rights reserved.
