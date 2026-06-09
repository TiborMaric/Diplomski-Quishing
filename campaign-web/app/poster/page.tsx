import { t } from "@/lib/i18n";

export const metadata = {
  title: "Poster — Sveučilišne nagrade 2026",
  // Hidden from search engines and social previews. The poster route is
  // not linked from anywhere; you only reach it by typing /poster directly.
  robots: {
    index: false,
    follow: false,
  },
};

export default function PosterPage() {
  return (
    <>
      <style>{`
        @page {
          size: A4 portrait;
          margin: 1.5cm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .poster-page {
            width: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          nav, header[data-app-header], aside {
            display: none !important;
          }
        }
      `}</style>

      <main
        className="poster-page mx-auto my-8 flex w-[210mm] min-h-[297mm] max-w-full flex-col items-center justify-between rounded-lg bg-white p-[1.5cm] text-center shadow-2xl print:my-0"
      >
        {/* Top: eyebrow + headline + subheadline */}
        <header className="flex w-full flex-col items-center">
          <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold uppercase tracking-wider text-amber-900">
            {t("poster.eyebrow")}
          </span>
          <h1 className="mt-6 text-6xl font-bold tracking-tight text-zinc-900">
            {t("poster.headline")}
          </h1>
          <p className="mt-4 text-2xl text-zinc-700">{t("poster.subheadline")}</p>
        </header>

        {/* Middle: QR code in a card + scan instruction */}
        <section className="flex flex-col items-center">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/qr.svg"
              alt={t("poster.qrAlt")}
              className="h-[10cm] w-[10cm]"
            />
          </div>
          <p className="mt-6 text-2xl font-semibold text-zinc-900">
            {t("poster.scanInstruction")}
          </p>
        </section>

        {/* Bottom: deadline, Instagram handle, footer */}
        <footer className="flex w-full flex-col items-center gap-2 text-zinc-700">
          <p className="text-xl">{t("poster.deadline")}</p>
          <p className="text-base">{t("common.instagramLine")}</p>
          <p className="mt-3 text-xs uppercase tracking-wider text-zinc-400">
            {t("poster.footer")}
          </p>
        </footer>
      </main>
    </>
  );
}
