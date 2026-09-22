"use client";

import { useState, useTransition } from "react";
import type { CommentItem } from "@/lib/data/emails";
import { postComment } from "@/app/emails/[id]/actions";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommentThread({
  emailId,
  comments,
  dbEnabled,
}: {
  emailId: string;
  comments: CommentItem[];
  dbEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");

  return (
    <section className="border-t border-hairline px-5 pt-5 pb-4">
      <h2 className="font-serif text-lg text-ink">
        Comments
        {comments.length > 0 && (
          <span className="ml-2 align-middle text-xs font-medium text-ink-3 tnums">
            {comments.length}
          </span>
        )}
      </h2>

      {comments.length === 0 ? (
        <p className="mt-2 text-sm text-ink-3">No comments yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-hairline bg-surface p-3.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-navy">
                  {c.authorName}
                  {c.authorRole === "admin" && (
                    <span className="ml-1.5 text-[11px] font-medium tracking-wide text-gold-ink">
                      admin
                    </span>
                  )}
                </p>
                <p className="shrink-0 text-xs text-ink-3 tnums">
                  {formatWhen(c.createdAt)}
                </p>
              </div>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {dbEnabled && (
        <div className="mt-3.5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Add a comment"
            className="w-full rounded-xl border border-hairline bg-raise p-3 text-sm text-ink placeholder:text-ink-3 focus:border-navy focus:bg-surface focus:outline-none"
          />
          <button
            disabled={pending || !body.trim()}
            onClick={() =>
              startTransition(async () => {
                await postComment(emailId, body);
                setBody("");
              })
            }
            className="mt-2 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-navy"
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </div>
      )}
    </section>
  );
}
