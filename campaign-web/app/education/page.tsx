import { cookies } from "next/headers";
import Link from "next/link";

import { t } from "@/lib/i18n";
import { markReachedEducation } from "@/lib/telemetry";

import { Scorecard } from "./Scorecard";

export default async function EducationPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("qsh_session")?.value;

  if (sessionToken) {
    // Best-effort. If the page is shared and the visitor never scanned,
    // there's no row to update — that's fine, swallow the error.
    try {
      await markReachedEducation(sessionToken);
    } catch {
      // Intentional no-op.
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 bg-[url('/poster-bg.png')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/95 to-slate-950" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        {/* ---------- Hero ---------- */}
        <header className="text-center">
          <span className="rounded-full bg-pink-500 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-white shadow-[0_8px_24px_rgba(236,72,153,0.45)]">
            {t("education.eyebrow")}
          </span>
          <h1 className="mt-6 text-4xl font-black uppercase leading-[1.05] tracking-tight text-emerald-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-6xl">
            {t("education.heroTitle")}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-white/90">
            {t("education.heroBody")}
          </p>
        </header>

        {/* ---------- Anatomy: screenshot ---------- */}
        <section className="mt-16">
          <h2 className="text-2xl font-black uppercase tracking-tight text-orange-300 sm:text-3xl">
            {t("education.anatomyTitle")}
          </h2>
          <p className="mt-2 text-sm text-white/80">{t("education.anatomyIntro")}</p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-pink-400/30 bg-slate-900/60 shadow-2xl">
            {/* Drop a screenshot of the live landing page at public/anatomija.png. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/anatomija.png"
              alt={t("education.screenshotAlt")}
              className="w-full"
            />
          </div>
        </section>

        {/* ---------- Clue cards ---------- */}
        <section className="mt-12 space-y-4">
          <Clue n="1" title={t("education.clue1Title")} body={t("education.clue1Body")} />
          <Clue n="2" title={t("education.clue2Title")} body={t("education.clue2Body")} />
          <Clue n="3" title={t("education.clue3Title")} body={t("education.clue3Body")} />
          <Clue n="4" title={t("education.clue4Title")} body={t("education.clue4Body")} />
          <Clue n="5" title={t("education.clue5Title")} body={t("education.clue5Body")} />
          <Clue n="6" title={t("education.clue6Title")} body={t("education.clue6Body")} />
        </section>

        {/* ---------- Scorecard ---------- */}
        <section className="mt-16">
          <h2 className="text-2xl font-black uppercase tracking-tight text-emerald-300 sm:text-3xl">
            {t("education.scorecardTitle")}
          </h2>
          <p className="mt-2 text-sm text-white/80">{t("education.scorecardIntro")}</p>
          <Scorecard />
        </section>

        {/* ---------- Defence tips ---------- */}
        <section className="mt-16">
          <h2 className="text-2xl font-black uppercase tracking-tight text-pink-300 sm:text-3xl">
            {t("education.defenseTitle")}
          </h2>
          <ol className="mt-6 space-y-4 text-base leading-relaxed text-white/90">
            <DefenseTip n="1" text={t("education.defense1")} />
            <DefenseTip n="2" text={t("education.defense2")} />
            <DefenseTip n="3" text={t("education.defense3")} />
            <DefenseTip n="4" text={t("education.defense4")} />
          </ol>
          <p className="mt-10 text-center text-2xl font-bold italic text-emerald-300 drop-shadow">
            {t("education.defenseFinal")}
          </p>
        </section>

        {/* ---------- Optional return CTA ---------- */}
        <div className="mt-20 flex justify-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-white/60 transition hover:text-emerald-300"
          >
            {t("education.backCta")}
          </Link>
        </div>

        {/* ---------- Footer disclosure ---------- */}
        <footer className="mt-12 text-center text-[10px] uppercase tracking-[0.2em] text-white/35">
          {t("common.studyDisclosure")}
        </footer>
      </div>
    </main>
  );
}

function Clue({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-pink-400/30 bg-slate-900/75 p-5 shadow-lg backdrop-blur-md transition hover:border-pink-400/60">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-base font-black text-white shadow-md">
          {n}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-300">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{body}</p>
        </div>
      </div>
    </article>
  );
}

function DefenseTip({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="font-black text-emerald-300">{n}.</span>
      <span>{text}</span>
    </li>
  );
}
