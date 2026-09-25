import Link from "next/link";
import type { ReactNode } from "react";
import type { AppUser } from "@/lib/auth";
import { authEnabled } from "@/lib/auth";
import { signOut } from "@/app/sign-in/actions";

type NavKey = "month" | "listings" | "metrics" | "submit";

const NAV: { key: NavKey; href: string; label: string; icon: ReactNode }[] = [
  { key: "month", href: "/", label: "This month", icon: <CalendarIcon /> },
  { key: "listings", href: "/listings", label: "Listings", icon: <HomeIcon /> },
  { key: "metrics", href: "/metrics", label: "Metrics", icon: <ChartIcon /> },
];

/**
 * Responsive frame for the app. On desktop a persistent left sidebar carries the
 * brand, primary nav, a submit action, and the signed-in user. On phones the
 * sidebar is replaced by a slim top bar with the same destinations, and the
 * page content flows underneath. Pages pass their `active` destination so the
 * nav can highlight it, and render their own content as children.
 */
export function AppShell({
  user,
  active,
  children,
}: {
  user: AppUser;
  active: NavKey;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-panel lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-deep-navy px-5 py-6 lg:flex">
        <Link href="/" className="block px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            Make Your Mark Legacy Team
          </p>
          <p className="mt-1 font-serif text-2xl leading-none text-white">
            Email Hub
          </p>
        </Link>

        <nav className="mt-9 flex flex-col gap-1">
          {NAV.map((item) => (
            <SideLink
              key={item.key}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active === item.key}
            />
          ))}
        </nav>

        <Link
          href="/submit"
          className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            active === "submit"
              ? "bg-gold text-deep-navy"
              : "bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          <PlusIcon />
          Submit a listing
        </Link>

        <Link
          href="/materials"
          className="mt-2 px-2 text-sm font-medium text-white/55 transition hover:text-white"
        >
          Send market data
        </Link>

        <div className="mt-auto pt-6">
          {authEnabled ? (
            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user.name ?? "Signed in"}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  {user.role === "admin" ? "Admin" : "Client"}
                </p>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-gold/60 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <p className="border-t border-white/10 pt-4 text-[11px] text-white/40">
              Dev mode: open as admin
            </p>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-deep-navy px-4 py-3 lg:hidden">
        <Link href="/" className="leading-tight">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">
            Make Your Mark
          </p>
          <p className="font-serif text-lg leading-none text-white">Email Hub</p>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active === item.key
                  ? "bg-white/15 text-white"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function SideLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <span className={active ? "text-gold" : "text-white/45 group-hover:text-white/70"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

/* ---- icons: 18px line icons, currentColor ------------------------------- */
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 11l8-6 8 6M6 10v9h12v-9" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
