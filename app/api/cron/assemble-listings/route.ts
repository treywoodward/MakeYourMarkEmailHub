import { NextResponse } from "next/server";
import { assembleListingEmail } from "@/lib/pipeline/assemble";

// Runs on a schedule (see vercel.json). Builds a listings email once a batch of
// submitted listings has settled. Guarded by CRON_SECRET when it is set.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const result = await assembleListingEmail();
  return NextResponse.json(result);
}
