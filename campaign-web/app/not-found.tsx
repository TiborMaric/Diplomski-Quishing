import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{t("notFound.title")}</h1>
      <p className="mt-3 text-sm text-zinc-600">{t("notFound.body")}</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        {t("notFound.home")}
      </Link>
    </main>
  );
}
