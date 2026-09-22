// Drizzle Kit config. `npm run db:push` applies lib/db/schema.ts to Neon.
// Reads DATABASE_URL from .env.local (the CLI does not load it automatically).
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
