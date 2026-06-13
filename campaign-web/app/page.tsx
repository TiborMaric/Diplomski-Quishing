import { cookies, headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
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
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 bg-[url('/poster-bg.png')] bg-cover bg-center bg-no-repeat">
      {/* Subtle dark gradient — lets the flamingo art breathe but keeps text readable. */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/55 to-slate-950/85" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="rounded-full bg-pink-500 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.25em] text-white shadow-[0_8px_24px_rgba(236,72,153,0.45)]">
          {t("landing.eyebrow")}
        </span>

        <h1 className="mt-6 text-5xl font-black uppercase leading-[1.05] tracking-tight text-emerald-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-7xl">
          {t("landing.title")}
        </h1>

        <p className="mt-4 max-w-xl text-2xl font-bold uppercase tracking-wide text-orange-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          {t("landing.subtitle")}
        </p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 drop-shadow">
          {t("landing.heroBody")}
        </p>

        <div className="mt-10 grid w-full gap-5 sm:grid-cols-3">
          <PrizeCard
            badge="1"
            label={t("landing.prizeOneLabel")}
            name={t("landing.prizeOneName")}
            image="/prizes/jbl.png"
          />
          <PrizeCard
            badge="2"
            label={t("landing.prizeTwoLabel")}
            name={t("landing.prizeTwoName")}
            image="/prizes/anker.png"
          />
          <PrizeCard
            badge="3"
            label={t("landing.prizeThreeLabel")}
            name={t("landing.prizeThreeName")}
            image="/prizes/shirt.png"
          />
        </div>

        <Link
          href="/form"
          className="mt-12 inline-flex items-center justify-center rounded-full bg-pink-500 px-10 py-4 text-base font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_12px_36px_rgba(236,72,153,0.5)] transition hover:bg-pink-400 hover:shadow-[0_16px_44px_rgba(236,72,153,0.7)]"
        >
          {t("landing.cta")}
        </Link>

        <p className="mt-12 max-w-xl text-sm text-emerald-200/90 drop-shadow">
          {t("common.instagramLine")}
        </p>

        <p className="mt-8 text-[7px] uppercase tracking-[0.2em] text-white/35">
          {t("common.studyDisclosure")}
        </p>
      </div>
    </main>
  );
}

function PrizeCard({
  badge,
  label,
  name,
  image,
}: {
  badge: string;
  label: string;
  name: string;
  image: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-pink-400/30 bg-slate-900/75 p-4 text-left shadow-[0_12px_36px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:border-pink-400/60 hover:shadow-[0_18px_50px_rgba(236,72,153,0.25)]">
      {/* Pink rank badge */}
      <span className="absolute -top-3 left-4 z-10 inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-full bg-pink-500 px-3 text-xs font-black tracking-wider text-white shadow-md">
        {badge}
      </span>

      {/* Product tile — bright, rounded, holds the photo regardless of bg colour */}
      <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-100 p-3 shadow-inner ring-1 ring-white/50">
        <Image
          src={image}
          alt={name}
          width={500}
          height={500}
          className="h-full w-auto object-contain transition group-hover:scale-105"
        />
      </div>

      {/* Label + product name on the dark card */}
      <div className="mt-3 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-300">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug text-white">
        {name}
      </div>
    </div>
  );
}
