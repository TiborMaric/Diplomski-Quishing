import { cookies } from "next/headers";
import { t } from "@/lib/i18n";
import { markReachedDebrief, recordDebriefInteraction } from "@/lib/telemetry";

export default async function DebriefPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("qsh_session")?.value;

  if (sessionToken) {
    // Independent writes — fire in parallel.
    await Promise.all([
      markReachedDebrief(sessionToken),
      recordDebriefInteraction(sessionToken, "viewed"),
    ]);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("debrief.title")}</h1>

      <p className="mt-6 text-base leading-relaxed text-zinc-700">{t("debrief.teaser1")}</p>
      <p className="mt-4 text-base leading-relaxed text-zinc-700">{t("debrief.teaser2")}</p>
      <p className="mt-4 text-base leading-relaxed text-zinc-700">{t("debrief.teaser3")}</p>

      <p className="mt-12 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {t("debrief.placeholderNotice")}
      </p>
    </main>
  );
}
