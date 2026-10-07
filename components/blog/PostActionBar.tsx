"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { setLike } from "@/app/blog/[slug]/actions";

const noopSubscribe = () => () => { };

function subscribeLikes(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("huk-like", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("huk-like", cb);
  };
}

function useLiked(postId: string): [boolean, (value: boolean) => void] {
  const key = `huk-liked:${postId}`;
  const liked = useSyncExternalStore(
    subscribeLikes,
    () => {
      try {
        return localStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
  const set = (value: boolean) => {
    try {
      if (value) localStorage.setItem(key, "1");
      else localStorage.removeItem(key);
    } catch { }
    window.dispatchEvent(new Event("huk-like"));
  };
  return [liked, set];
}

// Thanh cố định dưới cùng (quay lại, thích, bình luận, chia sẻ). Render qua
// portal ra <body> vì "position: fixed" bên trong DesktopFrame (transform) bị lệch.
export default function PostActionBar({
  postId,
  title,
  commentCount,
}: {
  postId: string;
  title: string;
  commentCount: number;
}) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [liked, setLiked] = useLiked(postId);
  const [toast, setToast] = useState<string | null>(null);

  if (!mounted) return null;

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    const result = await setLike(postId, next);
    if (result === null) setLiked(!next);
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("Đã sao chép liên kết");
    } catch { }
  }

  function goToComments() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const btn = "flex h-12 w-14 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/5 hover:text-black";

  return createPortal(
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex h-[76px] items-center justify-center gap-8 border-t border-black/10 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur sm:gap-16 lg:gap-24">
        <Link href="/blog" aria-label="Quay lại danh sách bài viết" className={btn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <button type="button" onClick={toggleLike} aria-label={liked ? "Bỏ thích" : "Thích bài viết"} aria-pressed={liked} className={btn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#e11d48" : "none"} aria-hidden="true">
            <path
              d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 4.8 6.9 4.8c1.9 0 3.4 1 5.1 3 1.7-2 3.2-3 5.1-3 3.3 0 5.2 3.2 4.1 6.4-1.7 4.7-9.2 9.3-9.2 9.3z"
              stroke={liked ? "#e11d48" : "currentColor"}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button type="button" onClick={goToComments} aria-label="Xem bình luận" className={`${btn} w-auto gap-2 px-4 text-sm font-medium`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{commentCount}</span>
        </button>
        <button type="button" onClick={share} aria-label="Chia sẻ" className={btn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 15V3M7 8l5-5 5 5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {toast && (
        <div role="status" className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded bg-black px-4 py-2 text-xs text-white">
          {toast}
        </div>
      )}
    </>,
    document.body,
  );
}
