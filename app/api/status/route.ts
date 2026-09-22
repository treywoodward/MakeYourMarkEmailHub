import { NextResponse } from "next/server";

// Public health check: reports which integrations are configured (booleans only,
// never any secret values), so deployment setup can be verified at a glance.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    database: Boolean(process.env.DATABASE_URL),
    auth: Boolean(process.env.ADMIN_PASSWORD || process.env.CLIENT_PASSWORD),
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    push: Boolean(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
    ),
  });
}
