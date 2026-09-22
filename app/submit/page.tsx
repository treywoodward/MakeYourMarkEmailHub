import { requireUser } from "@/lib/auth";
import { isBlobConfigured } from "@/lib/blob";
import { isAiConfigured } from "@/lib/ai/anthropic";
import { BackHeader } from "@/app/components/BackHeader";
import { SubmitListingForm } from "./SubmitListingForm";

export const dynamic = "force-dynamic";
// Vision extraction can take a while; give the action room.
export const maxDuration = 60;

export default async function SubmitPage() {
  await requireUser();
  return (
    <div className="mx-auto min-h-dvh max-w-[520px] bg-panel pb-12">
      <BackHeader href="/listings" label="Listings" />
      <div className="px-5 pt-8 pb-5">
        <div className="h-px w-9 bg-gold" />
        <h1 className="mt-3 font-serif text-3xl leading-tight text-navy">
          Submit a listing
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          Add a flexmls screenshot and photos. Claude reads the details into a
          listing you can turn into an email.
        </p>
      </div>
      <SubmitListingForm blobEnabled={isBlobConfigured} aiEnabled={isAiConfigured} />
    </div>
  );
}
