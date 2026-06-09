"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitEntry, type FormState } from "./actions";
import { t } from "@/lib/i18n";

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-pink-500 px-6 py-3.5 text-sm font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_10px_30px_rgba(236,72,153,0.45)] transition hover:bg-pink-400 hover:shadow-[0_14px_38px_rgba(236,72,153,0.6)] disabled:cursor-not-allowed disabled:bg-slate-600 disabled:shadow-none"
    >
      {pending ? t("form.submitting") : t("form.submitButton")}
    </button>
  );
}

export function FormClient() {
  const [state, formAction] = useActionState(submitEntry, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
          {t("form.firstNameLabel")}
        </span>
        <input
          type="text"
          name="firstName"
          required
          maxLength={60}
          autoComplete="given-name"
          placeholder={t("form.firstNamePlaceholder")}
          className="mt-1.5 block w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2.5 text-base text-white placeholder:text-white/30 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
        />
        {state.errors?.firstName && (
          <p className="mt-1.5 text-sm text-pink-300">{t(state.errors.firstName)}</p>
        )}
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
          {t("form.lastNameLabel")}
        </span>
        <input
          type="text"
          name="lastName"
          required
          maxLength={60}
          autoComplete="family-name"
          placeholder={t("form.lastNamePlaceholder")}
          className="mt-1.5 block w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2.5 text-base text-white placeholder:text-white/30 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
        />
        {state.errors?.lastName && (
          <p className="mt-1.5 text-sm text-pink-300">{t(state.errors.lastName)}</p>
        )}
      </label>

      {/* Honeypot — invisible to humans, attractive to naïve bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Tvrtka
          <input type="text" name="tvrtka" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
