import { requireUser } from "@/lib/auth";
import { isBlobConfigured } from "@/lib/blob";
import { AppShell } from "@/app/components/AppShell";
import { MaterialsForm } from "./MaterialsForm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function MaterialsPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="submit">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 lg:px-10 lg:pt-12">
        <div className="h-px w-9 bg-gold" />
        <h1 className="mt-3 font-serif text-4xl leading-tight text-navy lg:text-5xl">
          Send market data
        </h1>
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Drop in the numbers, sources, screenshots, or a PDF for the Market
          Pulse or the education email. Trey builds the email from what you send.
        </p>
        <div className="mt-6">
          <MaterialsForm blobEnabled={isBlobConfigured} />
        </div>
      </div>
    </AppShell>
  );
}
