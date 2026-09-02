"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "@/app/contact/actions";

const inputClasses =
  "w-full rounded-md border border-ink/25 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/60 focus:outline-none";

export default function ContactFormSection({
  formLabel,
  formHeadline,
  formSubtitle,
}: {
  formLabel: string;
  formHeadline: string;
  formSubtitle: string;
}) {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContactMessage,
    undefined,
  );

  return (
    <div className="px-6 py-20 sm:px-10 sm:py-28 lg:px-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="font-gilroy text-3xl font-bold text-black">{formLabel}</p>
        <h2 className="font-dfvn-desirable-calligraphy pb-4 text-4xl text-ink sm:text-4xl">{formHeadline}</h2>
        <p className="font-gilroy text-sm leading-relaxed text-ink/70">{formSubtitle}</p>
      </div>

      {state?.ok ? (
        <p className="font-gilroy mx-auto mt-12 max-w-2xl text-center text-base text-ink">
          Cảm ơn bạn! Tin nhắn đã được gửi, HUK Studio sẽ liên hệ lại sớm nhất.
        </p>
      ) : (
        <form action={formAction} className="mx-auto mt-12 flex max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-gilroy text-base font-bold text-black">
              Your Name*
            </label>
            <input id="name" name="name" type="text" required className={inputClasses} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-gilroy text-base font-bold text-black">
              Phone Number (+ Country Code)*
            </label>
            <input id="phone" name="phone" type="tel" required className={inputClasses} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-gilroy text-base font-bold text-black">
              Email Address*
            </label>
            <input id="email" name="email" type="email" required className={inputClasses} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="foundVia" className="font-gilroy text-base font-bold text-black">
              How did you find HUK Studio?
            </label>
            <input id="foundVia" name="foundVia" type="text" className={inputClasses} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="story" className="font-gilroy text-base font-bold text-black">
              A Little About Your Story
            </label>
            <textarea
              id="story"
              name="story"
              rows={5}
              placeholder="Share anything you'd like us to know."
              className={inputClasses}
            />
          </div>

          {state?.error && <p className="font-gilroy text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="font-gilroy mx-auto rounded-md bg-ink px-10 py-3 text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {pending ? "Đang gửi..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}
