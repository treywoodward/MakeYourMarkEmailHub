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

/**
 * List Dusty's email campaigns, most recently sent first. Returns [] when GHL
 * is not configured or the call fails, so the page never hard-errors.
 */
export async function listCampaigns(): Promise<Campaign[]> {
  if (!isGhlConfigured) return [];
  try {
    const url = `${BASE}/emails/schedule?locationId=${locationId}&limit=100`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        Accept: "application/json",
      },
      // Politeness: cache the campaign list briefly rather than hitting GHL on
      // every render. Metrics do not need to be second-fresh.
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { schedules?: ScheduleRow[] };
    const rows = data.schedules ?? [];
    return rows
      .map(normalize)
      .filter((c) => c.id && c.status !== "draft")
      .sort((a, b) => (b.sentAt ?? 0) - (a.sentAt ?? 0));
  } catch {
    return [];
  }
}

/** One campaign by id (there is no per-campaign GET, so read from the list). */
export async function getCampaign(id: string): Promise<Campaign | null> {
  const all = await listCampaigns();
  return all.find((c) => c.id === id) ?? null;
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
