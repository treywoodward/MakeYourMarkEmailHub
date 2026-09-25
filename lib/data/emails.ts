// Data-access layer for emails. Reads from Neon when DATABASE_URL is set, and
// falls back to seed data otherwise so the app runs before the DB exists.
// Writes require the DB.
import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db, isDbConfigured, requireDb } from "@/lib/db";
import { emails, comments, profiles, emailListings } from "@/lib/db/schema";
import { seedEmails } from "@/lib/seed";
import type { EmailCopy } from "@/lib/email/schemas";
import type { EmailSlot, EmailStatus, EmailType, UserRole } from "@/lib/types";
import type { AppUser } from "@/lib/auth";

export interface EmailListItem {
  id: string;
  month: string;
  slot: EmailSlot;
  type: EmailType;
  sendDate: string; // 'YYYY-MM-DD'
  status: EmailStatus;
  subject: string;
  previewText: string;
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorRole: UserRole | null;
  body: string;
  createdAt: string; // ISO
}

export interface EmailDetail extends EmailListItem {
  copy: EmailCopy | null;
  photos: string[][];
  comments: CommentItem[];
}

// ---- reads ----------------------------------------------------------------

export async function listMonthEmails(month: string): Promise<EmailListItem[]> {
  if (isDbConfigured && db) {
    try {
      const rows = await db
        .select()
        .from(emails)
        .where(eq(emails.month, month))
        .orderBy(asc(emails.sendDate));
      return rows.map((r) => ({
        id: r.id,
        month: r.month,
        slot: r.slot,
        type: r.type,
        sendDate: r.sendDate ?? "",
        status: r.status,
        subject: r.subject ?? "",
        previewText: r.previewText ?? "",
      }));
    } catch (err) {
      // Never hard-crash the page on a DB hiccup; degrade to seed and log so
      // the cause (usually a bad DATABASE_URL) is visible in the runtime logs.
      console.error("[data] listMonthEmails DB query failed; using seed. Check DATABASE_URL.", err);
    }
  }

  return seedListItems(month);
}

function seedListItems(month: string): EmailListItem[] {
  return seedEmails
    .filter((e) => e.month === month)
    .map((e) => ({
      id: e.id,
      month: e.month,
      slot: e.slot,
      type: e.type,
      sendDate: e.send_date,
      status: e.status,
      subject: e.subject,
      previewText: e.preview_text,
    }))
    .sort((a, b) => a.sendDate.localeCompare(b.sendDate));
}

export async function getEmailDetail(id: string): Promise<EmailDetail | null> {
  if (isDbConfigured && db) {
    try {
      const rows = await db.select().from(emails).where(eq(emails.id, id)).limit(1);
      const r = rows[0];
      if (!r) return seedDetail(id);
      const commentRows = await db
        .select({
          id: comments.id,
          body: comments.body,
          createdAt: comments.createdAt,
          authorName: profiles.name,
          authorEmail: profiles.email,
          authorRole: profiles.role,
        })
        .from(comments)
        .leftJoin(profiles, eq(comments.authorId, profiles.id))
        .where(eq(comments.emailId, id))
        .orderBy(asc(comments.createdAt));

      return {
        id: r.id,
        month: r.month,
        slot: r.slot,
        type: r.type,
        sendDate: r.sendDate ?? "",
        status: r.status,
        subject: r.subject ?? "",
        previewText: r.previewText ?? "",
        copy: r.copy ?? null,
        photos: r.photos ?? [],
        comments: commentRows.map((c) => ({
          id: c.id,
          authorName: c.authorName ?? c.authorEmail ?? "Someone",
          authorRole: c.authorRole ?? null,
          body: c.body,
          createdAt: c.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      console.error("[data] getEmailDetail DB query failed; using seed. Check DATABASE_URL.", err);
    }
  }

  return seedDetail(id);
}

function seedDetail(id: string): EmailDetail | null {
  const e = seedEmails.find((s) => s.id === id);
  if (!e) return null;
  return {
    id: e.id,
    month: e.month,
    slot: e.slot,
    type: e.type,
    sendDate: e.send_date,
    status: e.status,
    subject: e.subject,
    previewText: e.preview_text,
    copy: e.copy ?? null,
    photos: e.photos ?? [],
    comments: [],
  };
}

// ---- writes (require the DB) ----------------------------------------------

async function ensureProfile(user: AppUser) {
  const database = requireDb();
  await database
    .insert(profiles)
    .values({ id: user.id, email: user.email, name: user.name, role: user.role })
    .onConflictDoNothing();
}

export async function addComment(emailId: string, user: AppUser, body: string) {
  const database = requireDb();
  await ensureProfile(user);
  await database.insert(comments).values({ emailId, authorId: user.id, body });
}

/** Create a listing email from generated copy + rendered HTML, linking listings. */
export async function createListingEmail(input: {
  month: string;
  slot: EmailSlot;
  sendDate: string; // 'YYYY-MM-DD'
  copy: EmailCopy;
  html: string;
  photos: string[][];
  listingIds: string[];
}): Promise<string> {
  const database = requireDb();
  const [row] = await database
    .insert(emails)
    .values({
      month: input.month,
      slot: input.slot,
      type: "listing",
      sendDate: input.sendDate,
      status: "in_review",
      subject: input.copy.subject,
      previewText: input.copy.previewText,
      copy: input.copy,
      html: input.html,
      photos: input.photos,
    })
    .returning({ id: emails.id });

  if (input.listingIds.length) {
    await database.insert(emailListings).values(
      input.listingIds.map((id, i) => ({
        emailId: row.id,
        listingId: id,
        sortOrder: i,
      })),
    );
  }
  return row.id;
}

/** Emails currently awaiting the admin's review, most recent send date first. */
export async function emailsAwaitingReview(): Promise<EmailListItem[]> {
  if (!isDbConfigured || !db) return [];
  try {
    const rows = await db
      .select()
      .from(emails)
      .where(inArray(emails.status, ["in_review", "changes_requested"]))
      .orderBy(desc(emails.sendDate));
    return rows.map((r) => ({
      id: r.id,
      month: r.month,
      slot: r.slot,
      type: r.type,
      sendDate: r.sendDate ?? "",
      status: r.status,
      subject: r.subject ?? "",
      previewText: r.previewText ?? "",
    }));
  } catch (err) {
    console.error("[data] emailsAwaitingReview failed", err);
    return [];
  }
}

export async function setEmailStatus(emailId: string, status: EmailStatus) {
  const database = requireDb();
  await database.update(emails).set({ status }).where(eq(emails.id, emailId));
}

/** Save generated copy + rendered HTML onto an email. */
export async function setEmailContent(
  emailId: string,
  content: {
    copy: EmailCopy;
    html: string;
    subject: string;
    previewText: string;
    status: EmailStatus;
  },
) {
  const database = requireDb();
  await database
    .update(emails)
    .set({
      copy: content.copy,
      html: content.html,
      subject: content.subject,
      previewText: content.previewText,
      status: content.status,
    })
    .where(eq(emails.id, emailId));
}

export { isDbConfigured };
