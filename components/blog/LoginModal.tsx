"use client";

import { useActionState, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  requestLoginCode,
  verifyLoginCode,
  type LoginState,
} from "@/app/blog/[slug]/actions";

const noopSubscribe = () => () => {};
const CODE_LENGTH = 6;

function CodeInput({ onComplete }: { onComplete: () => void }) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function update(next: string[], focusIndex?: number) {
    setDigits(next);
    if (focusIndex !== undefined) refs.current[Math.min(focusIndex, CODE_LENGTH - 1)]?.focus();
    if (next.every((d) => d !== "")) setTimeout(onComplete, 50);
  }

  function handleChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      update(next);
      return;
    }
    const next = [...digits];
    clean
      .slice(0, CODE_LENGTH - index)
      .split("")
      .forEach((char, i) => {
        next[index + i] = char;
      });
    update(next, index + clean.length);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      update(next, index - 1);
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) refs.current[index + 1]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      <input type="hidden" name="code" value={digits.join("")} />
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={index === 0}
          aria-label={`Chữ số ${index + 1}`}
          className="h-14 w-11 rounded-lg border-2 border-black/15 bg-white text-center text-2xl font-semibold outline-none transition-colors focus:border-[#030712] sm:h-16 sm:w-14"
        />
      ))}
    </div>
  );
}

function Dialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const codeFormRef = useRef<HTMLFormElement>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, startResend] = useTransition();
  const [emailState, emailAction, emailPending] = useActionState<LoginState, FormData>(
    requestLoginCode,
    undefined,
  );
  const [codeState, codeAction, codePending] = useActionState<LoginState, FormData>(
    async (prev, formData) => {
      const result = await verifyLoginCode(prev, formData);
      if (result?.done) {
        router.refresh();
        onClose();
      }
      return result;
    },
    undefined,
  );

  const email = emailState?.step === "code" ? emailState.email : undefined;

  function resend() {
    if (!email) return;
    const fd = new FormData();
    fd.set("email", email);
    startResend(async () => {
      const result = await requestLoginCode(undefined, fd);
      setResendMessage(result?.error ?? "Đã gửi lại mã mới.");
    });
  }

  const input =
    "h-[52px] w-full rounded-lg border border-black/20 bg-white px-4 text-base outline-none transition-colors placeholder:text-black/35 focus:border-[#030712]";
  const primary =
    "h-[52px] w-full rounded-lg bg-[#030712] px-4 text-base font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[460px] rounded-2xl bg-white px-6 py-9 font-inter-sans text-[#030712] shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:px-11 sm:py-11"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-black/40 transition-colors hover:bg-black/5 hover:text-black"
        >
          &times;
        </button>

        {!email ? (
          <form action={emailAction} className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Login</h2>
              <p className="mt-2 text-sm text-black/55">
                Enter your email and we&rsquo;ll send you a 6-digit code.
              </p>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold">
              Email
              <input
                type="email"
                name="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="Enter your email"
                className={`${input} font-normal`}
              />
            </label>
            {emailState?.error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {emailState.error}
              </p>
            )}
            <button type="submit" disabled={emailPending} className={primary}>
              {emailPending ? "Sending..." : "Log in"}
            </button>
          </form>
        ) : (
          <form ref={codeFormRef} action={codeAction} className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Check your email</h2>
              <p className="mt-2 text-sm leading-relaxed text-black/55">
                We sent a 6-digit code to
                <br />
                <strong className="font-semibold text-black">{email}</strong>
              </p>
            </div>
            <input type="hidden" name="email" value={email} />
            <CodeInput onComplete={() => codeFormRef.current?.requestSubmit()} />
            {codeState?.error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                {codeState.error}
              </p>
            )}
            <button type="submit" disabled={codePending} className={primary}>
              {codePending ? "Verifying..." : "Verify"}
            </button>
            <div className="flex flex-col items-center gap-1 text-sm text-black/55">
              <p>
                Didn&rsquo;t get it?{" "}
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="font-semibold text-black underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </p>
              {resendMessage && <p className="text-xs">{resendMessage}</p>}
              <p className="text-xs">The code expires in 10 minutes.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Render qua portal ra <body> (position: fixed trong DesktopFrame bị lệch do transform).
export default function LoginModal({ children }: { children: (open: () => void) => React.ReactNode }) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(() => setOpen(true))}
      {mounted && open && createPortal(<Dialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
