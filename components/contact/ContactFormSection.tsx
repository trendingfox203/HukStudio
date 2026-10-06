"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "@/app/contact/actions";

const inputClasses =
  "font-gilroy w-full border-b border-ink/25 bg-transparent py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none";

const labelClasses = "font-aboreto text-xl tracking-[0.1em] text-black uppercase";

export default function ContactFormSection() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContactMessage,
    undefined,
  );

  if (state?.ok) {
    return (
      <p className="font-gilroy mt-4 text-sm text-ink">
        Cảm ơn bạn! Tin nhắn đã được gửi, HUK Studio sẽ liên hệ lại sớm nhất.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClasses}>
          Your Name*
        </label>
        <input id="name" name="name" type="text" required className={inputClasses} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className={labelClasses}>
          Phone Number (+ Country Code)*
        </label>
        <input id="phone" name="phone" type="tel" required className={inputClasses} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClasses}>
          Email Address*
        </label>
        <input id="email" name="email" type="email" required className={inputClasses} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="foundVia" className={labelClasses}>
          How Did You Find HUK Studio?
        </label>
        <input id="foundVia" name="foundVia" type="text" className={inputClasses} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="story" className={labelClasses}>
          A Little About Your Story
        </label>
        <textarea
          id="story"
          name="story"
          rows={2}
          placeholder="Share anything you'd like us to know."
          className={`${inputClasses} resize-none`}
        />
      </div>

      {state?.error && <p className="font-gilroy text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="font-aboreto mt-2 w-fit rounded bg-[#414141] px-8 py-3 text-xs font-bold tracking-[0.1em] text-white uppercase transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "Đang gửi..." : "Submit"}
      </button>
    </form>
  );
}
