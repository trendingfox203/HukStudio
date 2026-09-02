"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/login/actions";
import { TextInput, SubmitButton } from "@/components/admin/FormControls";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextInput label="Email" id="email" name="email" type="email" required />
      <TextInput label="Mật khẩu" id="password" name="password" type="password" required />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton disabled={pending} className="w-full justify-center disabled:opacity-50">
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </SubmitButton>
    </form>
  );
}
