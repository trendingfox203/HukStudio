"use client";

import { useActionState, useEffect, useRef } from "react";
import { PencilIcon } from "@/components/admin/icons";
import { SubmitButton } from "@/components/admin/FormControls";

export type EditState = { error?: string; ok?: boolean } | undefined;

export default function EditDialog({
  title,
  action,
  children,
  triggerClassName = "rounded bg-white/95 p-1.5 text-ink shadow-sm hover:bg-white",
}: {
  title: string;
  action: (prevState: EditState, formData: FormData) => Promise<EditState>;
  children: React.ReactNode;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) dialogRef.current?.close();
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dialogRef.current?.showModal();
        }}
        title="Sửa"
        className={triggerClassName}
      >
        <PencilIcon />
      </button>
      <dialog
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-[calc(100%-2rem)] max-w-md rounded-lg border border-black/5 bg-white p-6 shadow-lg backdrop:bg-black/50"
      >
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-ink">{title}</h3>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="text-ink/50 hover:text-ink"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
          {children}
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <SubmitButton disabled={pending} className="disabled:opacity-50">
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </SubmitButton>
        </form>
      </dialog>
    </>
  );
}
