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
      className="w-full rounded-md bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
    >
      {pending ? t("form.submitting") : t("form.submitButton")}
    </button>
  );
}

export function FormClient() {
  const [state, formAction] = useActionState(submitEntry, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4" noValidate>
      <label className="block">
        <span className="text-sm font-medium text-zinc-800">{t("form.firstNameLabel")}</span>
        <input
          type="text"
          name="firstName"
          required
          maxLength={60}
          autoComplete="given-name"
          placeholder={t("form.firstNamePlaceholder")}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
        {state.errors?.firstName && (
          <p className="mt-1 text-sm text-red-600">{t(state.errors.firstName)}</p>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-800">{t("form.lastNameLabel")}</span>
        <input
          type="text"
          name="lastName"
          required
          maxLength={60}
          autoComplete="family-name"
          placeholder={t("form.lastNamePlaceholder")}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-base focus:border-zinc-500 focus:outline-none"
        />
        {state.errors?.lastName && (
          <p className="mt-1 text-sm text-red-600">{t(state.errors.lastName)}</p>
        )}
      </label>

      {/* Honeypot — invisible to humans, attractive to naïve bots. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Tvrtka
          <input type="text" name="tvrtka" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
