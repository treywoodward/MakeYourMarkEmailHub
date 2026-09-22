// Neon + Drizzle database client.
// When DATABASE_URL is not set (e.g. before you create the free Neon project),
// `db` is null and the app falls back to seed data. Once the URL is set, real
// queries run against Neon.
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(url);

export const db = url ? drizzle(neon(url), { schema }) : null;

/** Get the db or throw a clear error (use where the DB is required). */
export function requireDb() {
  if (!db) {
    throw new Error(
      "DATABASE_URL is not set. Create a free Neon project and add it to .env.local.",
    );
  }
  return db;
}

export { schema };
