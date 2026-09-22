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
    <section className="px-4 pb-4">
      <h2 className="mb-2 font-serif text-lg text-navy">Comments</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-slate-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-hairline bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-navy">
                  {c.authorName}
                  {c.authorRole === "admin" && (
                    <span className="ml-1 text-xs font-normal text-gold">admin</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{formatWhen(c.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {dbEnabled && (
        <div className="mt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Add a comment"
            className="w-full rounded-lg border border-hairline p-2 text-sm focus:border-navy focus:outline-none"
          />
          <button
            disabled={pending || !body.trim()}
            onClick={() =>
              startTransition(async () => {
                await postComment(emailId, body);
                setBody("");
              })
            }
            className="mt-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Post
          </button>
        </div>
      )}
    </section>
  );
}
