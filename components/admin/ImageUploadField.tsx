"use client";

import { useState } from "react";
import { UploadIcon } from "@/components/admin/icons";

export default function ImageUploadField({
  name = "file",
  detectOrientation = false,
  required = true,
  label = "Ảnh",
  hint = "JPG, PNG — bấm để chọn file",
}: {
  name?: string;
  detectOrientation?: boolean;
  required?: boolean;
  label?: string;
  hint?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);

    if (detectOrientation) {
      const img = new window.Image();
      img.onload = () => {
        setOrientation(img.naturalHeight > img.naturalWidth ? "portrait" : "landscape");
      };
      img.src = url;
    }
  }

  return (
    <label className="flex cursor-pointer flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">{label}</span>
      <div className="flex items-center gap-4 rounded-md border border-dashed border-ink/25 bg-[#fafaf9] px-4 py-4 transition-colors hover:border-ink/40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Xem trước" className="h-16 w-16 shrink-0 rounded object-cover" />
        ) : (
          <UploadIcon className="h-8 w-8 shrink-0 text-ink/30" />
        )}
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="text-ink/80">{fileName ?? "Chọn ảnh từ máy"}</span>
          <span className="text-xs text-ink/40">{hint}</span>
        </div>
      </div>
      <input
        type="file"
        name={name}
        accept="image/*"
        required={required}
        onChange={handleChange}
        className="sr-only"
      />
      {detectOrientation && <input type="hidden" name="orientation" value={orientation} />}
    </label>
  );
}
