"use client";

import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "@/components/admin/icons";
import { compressImageForUpload } from "@/lib/client-image-resize";

type UploadedItem = { url: string; alt: string; storagePath: string; aspectRatio?: string };
type PendingItem = {
  id: string;
  file: File;
  preview: string;
  progress: "uploading" | "done" | "error";
  result?: UploadedItem;
};

const RATIO_OPTIONS = [
  { value: "", label: "Giữ nguyên tỉ lệ gốc" },
  { value: "1:1", label: "1:1 (vuông)" },
  { value: "4:5", label: "4:5 (đứng)" },
  { value: "3:4", label: "3:4 (đứng)" },
  { value: "16:9", label: "16:9 (ngang, rộng)" },
  { value: "3:2", label: "3:2 (ngang)" },
  { value: "9:16", label: "9:16 (đứng, cao)" },
  { value: "custom", label: "Tuỳ chỉnh..." },
];

export default function MultiImageUploadField({
  name = "files",
  folder = "blog",
  label = "Ảnh (chọn nhiều)",
  hint = "Có thể chọn nhiều ảnh cùng lúc",
}: {
  name?: string;
  folder?: "home" | "portfolio" | "about" | "contact" | "blog";
  label?: string;
  hint?: string;
}) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [ratioChoice, setRatioChoice] = useState("");
  const [customW, setCustomW] = useState("1");
  const [customH, setCustomH] = useState("1");
  const aspectRatio = ratioChoice === "custom" ? `${customW}:${customH}` : ratioChoice;

  async function uploadFile(id: string, file: File, ratio: string) {
    try {
      const compressed = await compressImageForUpload(file);
      const body = new FormData();
      body.set("file", compressed);
      body.set("folder", folder);
      if (ratio) body.set("aspectRatio", ratio);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) throw new Error("upload failed");
      const uploaded = (await res.json()) as { url: string; storagePath: string };
      const result: UploadedItem = { ...uploaded, alt: "", aspectRatio: ratio || undefined };
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, progress: "done", result } : item)));
    } catch {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, progress: "error" } : item)));
    }
  }

  // Nếu người dùng đổi tỉ lệ SAU khi đã chọn ảnh (thứ tự ngược), tự động
  // tải lại (crop lại) các ảnh đã xong theo tỉ lệ mới thay vì giữ nguyên
  // tỉ lệ lúc chọn file. Debounce 400ms để gõ số Tuỳ chỉnh không bắn liên
  // tiếp nhiều lần upload cho từng phím gõ.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setItems((prev) => {
        const staleIds = prev
          .filter((item) => item.progress === "done" && item.result?.aspectRatio !== (aspectRatio || undefined))
          .map((item) => item.id);
        if (staleIds.length === 0) return prev;
        const next = prev.map((item) =>
          staleIds.includes(item.id) ? ({ ...item, progress: "uploading" } as PendingItem) : item,
        );
        for (const item of prev) {
          if (staleIds.includes(item.id)) uploadFile(item.id, item.file, aspectRatio);
        }
        return next;
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const pending: PendingItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      progress: "uploading",
    }));
    setItems((prev) => [...prev, ...pending]);
    pending.forEach((item) => uploadFile(item.id, item.file, aspectRatio));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const uploadingCount = items.filter((i) => i.progress === "uploading").length;
  const errorCount = items.filter((i) => i.progress === "error").length;
  const doneCount = items.filter((i) => i.progress === "done").length;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <select
          value={ratioChoice}
          onChange={(e) => setRatioChoice(e.target.value)}
          className="rounded-md border border-black/10 bg-[#fafaf9] px-3 py-2 text-sm text-ink outline-none focus:border-ink/40 focus:bg-white"
        >
          {RATIO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {ratioChoice === "custom" && (
          <div className="flex items-center gap-1.5 text-sm text-ink/70">
            <div className="flex flex-col items-center gap-0.5">
              <input
                type="number"
                min={1}
                value={customW}
                onChange={(e) => setCustomW(e.target.value)}
                className="w-14 rounded-md border border-black/10 bg-[#fafaf9] px-2 py-2 text-center outline-none focus:border-ink/40 focus:bg-white"
              />
              <span className="text-[10px] tracking-wide text-ink/40 uppercase">Rộng</span>
            </div>
            <span className="pb-4">:</span>
            <div className="flex flex-col items-center gap-0.5">
              <input
                type="number"
                min={1}
                value={customH}
                onChange={(e) => setCustomH(e.target.value)}
                className="w-14 rounded-md border border-black/10 bg-[#fafaf9] px-2 py-2 text-center outline-none focus:border-ink/40 focus:bg-white"
              />
              <span className="text-[10px] tracking-wide text-ink/40 uppercase">Cao</span>
            </div>
          </div>
        )}
      </div>
      <label className="flex cursor-pointer flex-col gap-3 rounded-md border border-dashed border-ink/25 bg-[#fafaf9] px-4 py-4 transition-colors hover:border-ink/40">
        <div className="flex items-center gap-4">
          <UploadIcon className="h-8 w-8 shrink-0 text-ink/30" />
          <div className="flex flex-col gap-0.5 text-sm">
            <span className={uploadingCount === 0 && doneCount > 0 && errorCount === 0 ? "text-green-700" : "text-ink/80"}>
              {items.length > 0
                ? uploadingCount > 0
                  ? `Đang tải lên ${uploadingCount}/${items.length} ảnh...`
                  : errorCount > 0
                    ? `Đã tải lên ${doneCount}/${items.length} ảnh — ${errorCount} ảnh lỗi`
                    : `✓ Đã tải lên xong ${doneCount} ảnh`
                : "Chọn ảnh từ máy"}
            </span>
            <span className="text-xs text-ink/40">{hint}</span>
          </div>
        </div>
        <input type="file" accept="image/*" multiple onChange={handleChange} className="sr-only" />
      </label>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative h-16 w-16 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt={item.file.name}
                className={`h-16 w-16 rounded object-cover ${item.progress === "uploading" ? "opacity-40" : ""}`}
              />
              {item.progress === "error" && (
                <span className="absolute inset-0 flex items-center justify-center rounded bg-red-600/70 text-[10px] text-white">
                  Lỗi
                </span>
              )}
              {item.progress === "done" && (
                <span className="absolute -bottom-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                  ✓
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-paper"
                aria-label="Bỏ ảnh này"
              >
                &times;
              </button>
              {item.progress === "done" && item.result && (
                <input type="hidden" name={name} value={JSON.stringify(item.result)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
