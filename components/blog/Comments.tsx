"use client";

import { useActionState, useState } from "react";
import { addComment, logoutVisitor, type CommentState } from "@/app/blog/[slug]/actions";
import LoginModal from "@/components/blog/LoginModal";
import type { BlogComment } from "@/lib/blog-engagement";

function formatWhen(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Comments({
  postId,
  slug,
  comments,
  userName,
}: {
  postId: string;
  slug: string;
  comments: BlogComment[];
  userName: string | null;
}) {
  const [newestFirst, setNewestFirst] = useState(true);
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    addComment.bind(null, postId, slug),
    undefined,
  );
  const list = newestFirst ? comments : [...comments].reverse();
  const loggedIn = userName !== null;

  return (
    <section id="comments" className="scroll-mt-6 border-t border-black/10 pt-8 xl:pt-[calc(40*var(--u))]">
      <div className="flex items-center justify-between">
        <h2 className="font-forma-display text-lg font-bold xl:text-[calc(18*var(--u))]">Reply</h2>
        <select
          value={newestFirst ? "new" : "old"}
          onChange={(e) => setNewestFirst(e.target.value === "new")}
          aria-label="Sắp xếp bình luận"
          className="rounded border border-black/15 bg-white px-2 py-1 text-sm text-black/70 xl:text-[calc(14*var(--u))]"
        >
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
        </select>
      </div>

      <LoginModal>
        {(openLogin) => (
          <form
            key={state?.ok ? "sent" : "draft"}
            action={formAction}
            className="mt-4 flex gap-3 xl:mt-[calc(16*var(--u))] xl:gap-[calc(16*var(--u))]"
          >
            <div
              aria-hidden="true"
              className="mt-1 h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-400 xl:h-[calc(28*var(--u))] xl:w-[calc(28*var(--u))]"
            />
            <div className="flex flex-1 flex-col gap-2">
              <textarea
                name="body"
                required={loggedIn}
                maxLength={2000}
                readOnly={!loggedIn}
                onFocus={loggedIn ? undefined : openLogin}
                placeholder="Add your comment..."
                className="min-h-40 resize-y rounded border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40 xl:min-h-[calc(160*var(--u))]"
              />
              {loggedIn ? (
                <div className="flex items-center justify-between gap-4">
                  <p role="status" className={`min-w-0 truncate text-xs ${state?.error ? "text-red-600" : "text-black/50"}`}>
                    {state?.error ??
                      (state?.ok ? "Đã gửi bình luận." : (
                        <>
                          Commenting as {userName} ·{" "}
                          <button type="button" onClick={() => logoutVisitor(slug)} className="underline">
                            Log out
                          </button>
                        </>
                      ))}
                  </p>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded bg-[#030712] px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    {pending ? "Đang gửi..." : "Post"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-black/60">
                  <button type="button" onClick={openLogin} className="font-semibold text-black underline">
                    Login
                  </button>{" "}
                  with your email to participate
                </p>
              )}
            </div>
          </form>
        )}
      </LoginModal>

      <ul className="mt-8 flex flex-col gap-6 xl:mt-[calc(32*var(--u))] xl:gap-[calc(24*var(--u))]">
        {list.length === 0 && (
          <li className="text-sm text-black/40">No comments yet. Be the first to comment.</li>
        )}
        {list.map((comment) => (
          <li key={comment.id} className="flex gap-3 xl:gap-[calc(16*var(--u))]">
            <div
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-semibold text-black/60 uppercase xl:h-[calc(28*var(--u))] xl:w-[calc(28*var(--u))]"
            >
              {comment.authorName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold xl:text-[calc(14*var(--u))]">
                {comment.authorName}
                <span className="ml-2 text-xs font-normal text-black/40">{formatWhen(comment.createdAt)}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed font-light break-words whitespace-pre-line xl:text-[calc(15*var(--u))] xl:leading-[calc(22.5*var(--u))]">
                {comment.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
