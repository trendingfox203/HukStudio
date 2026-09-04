"use client";

import { useState } from "react";
import { UploadIcon } from "@/components/admin/icons";
import { uploadRawToBlob } from "@/lib/blob-client-upload";

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

export default function ImageUploadField({
  name = "file",
  aspectRatioFieldName = "aspectRatio",
  detectOrientation = false,
  withAspectRatio = false,
  defaultAspectRatio,
  required = true,
  label = "Ảnh",
  hint = "JPG, PNG — bấm để chọn file",
}: {
  name?: string;
  aspectRatioFieldName?: string;
  detectOrientation?: boolean;
  withAspectRatio?: boolean;
  defaultAspectRatio?: string;
  required?: boolean;
  label?: string;
  hint?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [rawPath, setRawPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isKnownPreset = defaultAspectRatio && RATIO_OPTIONS.some((o) => o.value === defaultAspectRatio);
  const [ratioChoice, setRatioChoice] = useState(
    defaultAspectRatio ? (isKnownPreset ? defaultAspectRatio : "custom") : "",
  );
  const [customW, setCustomW] = useState(
    !isKnownPreset && defaultAspectRatio ? defaultAspectRatio.split(":")[0] || "1" : "1",
  );
  const [customH, setCustomH] = useState(
    !isKnownPreset && defaultAspectRatio ? defaultAspectRatio.split(":")[1] || "1" : "1",
  );
  const aspectRatio = ratioChoice === "custom" ? `${customW}:${customH}` : ratioChoice;

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    setRawPath(null);
    setUploadError(null);

    if (detectOrientation) {
      const img = new window.Image();
      img.onload = () => {
        setOrientation(img.naturalHeight > img.naturalWidth ? "portrait" : "landscape");
      };
      img.src = url;
    }

    // Vercel giới hạn cứng request body 4.5MB (Server Action lẫn API route)
    // — ảnh gốc máy ảnh (20-40MB) được upload THẲNG lên Vercel Blob ngay
    // khi chọn file (bỏ qua giới hạn này hoàn toàn), rồi xoá file khỏi
    // input để lúc submit form không gửi file gốc qua Server Action nữa —
    // chỉ gửi kèm đường dẫn tạm (`${name}RawPath`) để server tự xử lý
    // (nén 1 lần duy nhất, không nén 2 lần làm giảm chất lượng ảnh).
    setUploading(true);
    try {
      const path = await uploadRawToBlob(file);
      setRawPath(path);
      input.value = "";
    } catch {
      setUploadError("Tải ảnh lên thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
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
          <span className="text-xs text-ink/40">
            {uploading ? "Đang tải ảnh lên..." : uploadError ? uploadError : hint}
          </span>
        </div>
      </div>
      <input
        type="file"
        name={name}
        accept="image/*"
        required={required && !rawPath}
        onChange={handleChange}
        disabled={uploading}
        className="sr-only"
      />
      <input type="hidden" name={`${name}RawPath`} value={rawPath ?? ""} />
      {detectOrientation && <input type="hidden" name="orientation" value={orientation} />}
      {withAspectRatio && (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
          <input type="hidden" name={aspectRatioFieldName} value={aspectRatio} />
        </div>
      )}
    </label>
  );
}
