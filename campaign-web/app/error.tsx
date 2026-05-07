"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t("errors.title")}</h1>
      <p className="mt-3 text-sm text-zinc-600">{t("errors.body")}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t("errors.retry")}
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
        >
          {t("errors.home")}
        </Link>
      </div>
    </main>
  );
}
