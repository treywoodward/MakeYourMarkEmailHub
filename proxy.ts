// Next.js 16 renamed middleware.ts to proxy.ts. clerkMiddleware() only attaches
// the auth context; actual protection is done per-page with requireUser() (the
// resource-based approach Clerk now recommends). Until Clerk is configured this
// is a pass-through, so the app runs openly in development.
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default authEnabled
  ? clerkMiddleware()
  : function passthrough() {
      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
