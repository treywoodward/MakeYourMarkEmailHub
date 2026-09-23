import { requireUser } from "@/lib/auth";
import { isBlobConfigured } from "@/lib/blob";
import { isAiConfigured } from "@/lib/ai/anthropic";
import { AppShell } from "@/app/components/AppShell";
import { SubmitListingForm } from "./SubmitListingForm";

export const dynamic = "force-dynamic";
// Vision extraction can take a while; give the action room.
export const maxDuration = 60;

export default async function SubmitPage() {
  const user = await requireUser();
  return (
    <AppShell user={user} active="submit">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 lg:px-10 lg:pt-12">
        <div className="h-px w-9 bg-gold" />
        <h1 className="mt-3 font-serif text-4xl leading-tight text-navy lg:text-5xl">
          Submit a listing
        </h1>
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Add a flexmls screenshot and photos. The details are read into a
          listing you can turn into an email.
        </p>
        <div className="mt-6">
          <SubmitListingForm
            blobEnabled={isBlobConfigured}
            aiEnabled={isAiConfigured}
          />
        </div>
      </div>
    </AppShell>
  );
}
