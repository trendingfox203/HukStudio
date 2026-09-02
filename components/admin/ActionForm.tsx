"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton disabled={pending} className="disabled:opacity-50">
        {pending ? pendingLabel : submitLabel}
      </SubmitButton>
    </form>
  );
}
