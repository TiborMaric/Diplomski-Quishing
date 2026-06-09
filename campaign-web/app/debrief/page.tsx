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
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 bg-[url('/poster-bg.png')] bg-cover bg-center bg-no-repeat">
      {/* Same overlay as the form so the transition feels seamless. */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950/95" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-emerald-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] sm:text-5xl">
          {t("debrief.title")}
        </h1>

        <div className="mt-6 h-1 w-16 rounded-full bg-pink-500" />

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 drop-shadow">
          {t("debrief.teaser1")}
        </p>
      </div>
    </main>
  );
}
