import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const isPg = !!process.env.DATABASE_URL?.startsWith("postgres");

export default defineConfig(
  isPg
    ? {
        out: "./migrations",
        schema: "./shared/schema.ts",
        dialect: "postgresql",
        dbCredentials: {
          url: process.env.DATABASE_URL!,
        },
      }
    : {
        out: "./migrations",
        schema: "./shared/schema.ts",
        dialect: "sqlite",
        dbCredentials: {
          url: process.env.SQLITE_PATH || "./data.db",
        },
      }
);
