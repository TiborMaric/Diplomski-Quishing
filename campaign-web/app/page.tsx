import { cookies, headers } from "next/headers";
import { t } from "@/lib/i18n";
import { recordScan } from "@/lib/telemetry";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const sessionToken = cookieStore.get("qsh_session")?.value;

  if (sessionToken) {
    await recordScan(sessionToken, {
      userAgent: headerStore.get("user-agent"),
      referrer: headerStore.get("referer"),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-900">
        {t("landing.eyebrow")}
      </span>

      <h1 className="mt-6 bg-gradient-to-br from-zinc-900 to-zinc-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
        {t("landing.title")}
      </h1>

      <p className="mt-4 max-w-2xl text-xl text-zinc-700">{t("landing.subtitle")}</p>

      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t("landing.prizeOneLabel")}
          </div>
          <div className="mt-1 text-base font-medium text-zinc-900">
            {t("landing.prizeOneName")}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-left shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t("landing.prizeTwoLabel")}
          </div>
          <div className="mt-1 text-base font-medium text-zinc-900">
            {t("landing.prizeTwoName")}
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600">
        {t("landing.heroBody")}
      </p>

      <a
        href="/form"
        className="mt-10 inline-flex items-center justify-center rounded-md bg-zinc-900 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-zinc-800 hover:shadow-lg"
      >
        {t("landing.cta")}
      </a>

      <p className="mt-12 text-sm text-zinc-500">{t("common.instagramLine")}</p>
      <p className="mt-2 text-xs text-zinc-400">{t("landing.deadline")}</p>
    </main>
  );
}
