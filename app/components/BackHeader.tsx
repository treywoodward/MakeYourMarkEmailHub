import Link from "next/link";

export function BackHeader({
  href = "/",
  label = "This month",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-deep-navy px-5 py-3 backdrop-blur">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm text-white/70 transition hover:text-gold"
      >
        <span aria-hidden className="text-base leading-none">
          ‹
        </span>
        {label}
      </Link>
    </header>
  );
}
