// Load September 2026's emails from lib/seed.ts into Neon.
// Run after `npm run db:push`, with DATABASE_URL set in .env.local:
//   npm run db:seed
// Idempotent: it clears the month first, then inserts.
//
// Uses relative imports (not the @/ alias) so it runs under tsx without alias
// resolution. DATABASE_URL is loaded by `--env-file=.env.local` (see package.json).
import { eq } from "drizzle-orm";
import { requireDb } from "../lib/db";
import { emails } from "../lib/db/schema";
import { seedEmails, seedMonth } from "../lib/seed";

async function main() {
  const db = requireDb();

  await db.delete(emails).where(eq(emails.month, seedMonth));

  for (const e of seedEmails) {
    await db.insert(emails).values({
      month: e.month,
      slot: e.slot,
      type: e.type,
      sendDate: e.send_date,
      status: e.status,
      subject: e.subject,
      previewText: e.preview_text,
      copy: e.copy ?? null,
      photos: e.photos ?? null,
    });
  }

  console.log(`Seeded ${seedEmails.length} emails for ${seedMonth}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
