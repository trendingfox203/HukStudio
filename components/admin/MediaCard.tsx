import Image from "next/image";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { TrashIcon, ExternalLinkIcon, GripIcon } from "@/components/admin/icons";

export default function MediaCard({
  src,
  alt,
  label,
  externalUrl,
  aspect = "aspect-square",
  deleteAction,
  editSlot,
}: {
  src: string;
  alt: string;
  label?: string;
  externalUrl?: string;
  aspect?: string;
  deleteAction: () => Promise<void>;
  editSlot?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
      <div className={`relative ${aspect} cursor-grab bg-ink/5 active:cursor-grabbing`}>
        <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 20vw, 40vw" />

        <div className="pointer-events-none absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded bg-white/90 text-ink/60 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <GripIcon />
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {editSlot}
          <form action={deleteAction}>
            <ConfirmSubmitButton
              message="Xoá mục này? Không thể hoàn tác."
              title="Xoá"
              className="rounded bg-white/95 p-1.5 text-red-600 shadow-sm hover:bg-white"
            >
              <TrashIcon />
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>
      {(label || externalUrl) && (
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          {label && <p className="truncate text-xs text-ink/80">{label}</p>}
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở link ngoài"
              className="shrink-0 text-ink/40 hover:text-ink"
            >
              <ExternalLinkIcon />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
