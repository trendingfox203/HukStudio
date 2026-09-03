"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { SubmitButton } from "@/components/admin/FormControls";

export type ActionState = { error?: string } | undefined;

export default function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Đang xử lý...",
  className = "flex flex-col gap-4",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [formKey, setFormKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const wasPending = useRef(false);

  // Sau khi submit thành công (hết pending, không có lỗi): đổi key để React
  // remount toàn bộ form — xoá sạch input cũ (kể cả state nội bộ của
  // ImageUploadField/MultiImageUploadField) — và hiện thông báo đã lưu.
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setFormKey((k) => k + 1);
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form key={formKey} action={formAction} className={className}>
      {children}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {showSuccess && <p className="text-sm text-green-700">✓ Đã lưu thành công</p>}
      <SubmitButton disabled={pending} className="disabled:opacity-50">
        {pending ? pendingLabel : submitLabel}
      </SubmitButton>
    </form>
  );
}
