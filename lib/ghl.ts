// GoHighLevel (LeadConnector) client for reading Dusty's sent email campaigns.
// Read-only. Uses a Private Integration token on Dusty's sub-account.
//
// What works today with the token's current scopes:
//   GET /emails/schedule  -> per-campaign delivery counts (recipients, delivered,
//                            failed) plus subject, send date, and status.
// Opens/clicks/bounces live behind the "Campaigns V2 / Statistics" scope, which
// the current token does not yet carry (that route returns 401 "not authorized
// for this scope"). When the scope is added, wire engagement in here.
import "server-only";

const BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

const token = process.env.GHL_PRIVATE_TOKEN;
const locationId = process.env.GHL_LOCATION_ID;

export const isGhlConfigured = Boolean(token && locationId);

/** A sent email campaign, normalized to just what the metrics view needs. */
export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string; // "complete", "draft", "scheduled", ...
  sentAt: number | null; // epoch ms, best-known send/schedule time
  recipients: number; // total attempted
  delivered: number; // accepted by the receiving server
  failed: number; // hard failures (bad address, bounce at send time)
  deliveryRate: number | null; // delivered / recipients, 0..1
  htmlUrl: string | null; // hosted copy of the exact HTML that was sent
}

interface ScheduleRow {
  id?: string;
  _id?: string;
  name?: string;
  subject?: string;
  status?: string;
  totalCount?: number;
  successCount?: number;
  success?: number;
  failed?: number;
  dateScheduled?: number;
  dateAdded?: number;
  createdAt?: string;
  updatedAt?: string;
  // The non-tracking copy renders the email without firing open/click pixels,
  // so previewing a campaign here never pollutes Dusty's real stats.
  nonTrackingDownloadUrl?: string;
  downloadUrl?: string;
}

function normalize(row: ScheduleRow): Campaign {
  const recipients = row.totalCount ?? 0;
  const delivered = row.successCount ?? row.success ?? 0;
  const failed = row.failed ?? 0;
  const sentAt =
    row.dateScheduled ??
    row.dateAdded ??
    (row.createdAt ? Date.parse(row.createdAt) : null);
  return {
    id: row.id ?? row._id ?? "",
    name: row.name ?? "Untitled campaign",
    subject: row.subject ?? "",
    status: row.status ?? "unknown",
    sentAt: sentAt && Number.isFinite(sentAt) ? sentAt : null,
    recipients,
    delivered,
    failed,
    deliveryRate: recipients > 0 ? delivered / recipients : null,
    htmlUrl: row.nonTrackingDownloadUrl ?? row.downloadUrl ?? null,
  };
}

/** Fetch the raw schedule rows (sent + drafts) once, cached briefly. */
async function fetchSchedules(): Promise<ScheduleRow[]> {
  if (!isGhlConfigured) return [];
  try {
    const url = `${BASE}/emails/schedule?locationId=${locationId}&limit=100`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        Accept: "application/json",
      },
      // Politeness: cache the list briefly rather than hitting GHL every render.
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { schedules?: ScheduleRow[] };
    return data.schedules ?? [];
  } catch {
    return [];
  }
}

/**
 * List Dusty's SENT email campaigns, most recently sent first. Returns [] when
 * GHL is not configured or the call fails, so the page never hard-errors.
 */
export async function listCampaigns(): Promise<Campaign[]> {
  const rows = await fetchSchedules();
  return rows
    .map(normalize)
    .filter((c) => c.id && c.status !== "draft")
    .sort((a, b) => (b.sentAt ?? 0) - (a.sentAt ?? 0));
}

/** An unsent draft email in GoHighLevel. */
export interface Draft {
  id: string;
  name: string;
  htmlUrl: string | null;
  updatedAt: number | null;
}

/**
 * List GHL drafts (unsent), most recently edited first. Drafts not touched in
 * the last 30 days are hidden so old test drafts do not clutter the dashboard.
 */
export async function listDrafts(): Promise<Draft[]> {
  const rows = await fetchSchedules();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return rows
    .filter((r) => (r.status ?? "") === "draft" && (r.id ?? r._id))
    .map((r) => ({
      id: r.id ?? r._id ?? "",
      name: r.name ?? "Untitled draft",
      // Drafts carry only downloadUrl (no non-tracking copy); it is unsent, so
      // no tracking pixels fire regardless.
      htmlUrl: r.downloadUrl ?? r.nonTrackingDownloadUrl ?? null,
      updatedAt: r.updatedAt ? Date.parse(r.updatedAt) : null,
    }))
    .filter((d) => d.updatedAt != null && d.updatedAt >= cutoff)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/** One draft by id. */
export async function getDraft(id: string): Promise<Draft | null> {
  const all = await listDrafts();
  return all.find((d) => d.id === id) ?? null;
}

/** One campaign by id (there is no per-campaign GET, so read from the list). */
export async function getCampaign(id: string): Promise<Campaign | null> {
  const all = await listCampaigns();
  return all.find((c) => c.id === id) ?? null;
}

/**
 * Which real GHL campaign a planned email corresponds to, keyed by
 * `${month}:${slot}`. For a sent email that has a match here, the detail view
 * renders the exact HTML that went out through GHL instead of our re-render, so
 * the preview matches what recipients actually got. Unmapped (future / draft)
 * emails fall back to the code-rendered copy.
 */
export const GHL_CAMPAIGN_BY_KEY: Record<string, string> = {
  "2026-09:holiday": "6a9da30c6316ab71ecffece3", // Labor Day, sent 9/7
  "2026-09:week2": "6aa41b637919774ef2faf6ae", // Market Pulse, sent 9/17
  "2026-09:week3": "6ab1398e173deedb778b780e", // 4 Listings, sent 9/21
};

/** The exact sent HTML for a planned email, or null if it has no GHL match. */
export async function ghlHtmlForEmail(
  month: string,
  slot: string,
): Promise<string | null> {
  if (!isGhlConfigured) return null;
  const id = GHL_CAMPAIGN_BY_KEY[`${month}:${slot}`];
  if (!id) return null;
  const campaign = await getCampaign(id);
  if (!campaign?.htmlUrl) return null;
  return getCampaignHtml(campaign.htmlUrl);
}

/**
 * Fetch the exact HTML a campaign sent, following the hosted redirect. Returns
 * null on any failure so the detail page can fall back gracefully.
 */
export async function getCampaignHtml(htmlUrl: string): Promise<string | null> {
  try {
    const res = await fetch(htmlUrl, {
      redirect: "follow",
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
