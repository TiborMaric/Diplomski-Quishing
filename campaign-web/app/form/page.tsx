import { cookies } from "next/headers";
import { t } from "@/lib/i18n";
import { markReachedForm } from "@/lib/telemetry";
import { FormClient } from "./FormClient";

export default async function FormPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("qsh_session")?.value;
  if (sessionToken) {
    await markReachedForm(sessionToken);
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 bg-[url('/poster-bg.png')] bg-cover bg-center bg-no-repeat">
      {/* Heavier overlay than the landing — the form is the focus, the flamingos set the mood. */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/85 to-slate-950/95" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-pink-400/25 bg-slate-900/75 p-8 shadow-2xl backdrop-blur-md">
          <h1 className="text-2xl font-black uppercase tracking-tight text-emerald-300 drop-shadow sm:text-3xl">
            {t("form.title")}
          </h1>
          <p className="mt-2 text-sm text-white/80">{t("form.subtitle")}</p>
          <FormClient />
        </div>
        <p className="mt-6 text-center text-xs text-emerald-200/70">
          {t("form.privacyNote")}
        </p>
        <p className="mt-4 text-center text-[7px] uppercase tracking-[0.2em] text-white/35">
          {t("common.studyDisclosure")}
        </p>
      </div>
    </main>
  );
}
