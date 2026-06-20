"use client";

import { useState } from "react";

import { t } from "@/lib/i18n";

const ITEMS = [
  "scorecardItem1",
  "scorecardItem2",
  "scorecardItem3",
  "scorecardItem4",
  "scorecardItem5",
  "scorecardItem6",
] as const;

export function Scorecard() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const score = checked.size;
  const total = ITEMS.length;

  let verdictKey: string;
  if (score === 0) verdictKey = "education.scorecardVerdictZero";
  else if (score <= 2) verdictKey = "education.scorecardVerdictLow";
  else if (score <= 4) verdictKey = "education.scorecardVerdictMid";
  else verdictKey = "education.scorecardVerdictHigh";

  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-slate-900/75 p-6 shadow-xl backdrop-blur-md">
      <ul className="space-y-3">
        {ITEMS.map((key, i) => {
          const isChecked = checked.has(i);
          return (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(i)}
                  className="mt-1 h-5 w-5 cursor-pointer accent-pink-500"
                />
                <span
                  className={`text-sm leading-relaxed transition ${
                    isChecked ? "text-emerald-200" : "text-white/85"
                  }`}
                >
                  {t(`education.${key}`)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl bg-slate-950/60 p-5 text-center ring-1 ring-pink-400/20">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
          {t("education.scorecardResultLabel")}
        </p>
        <p className="mt-2 text-4xl font-black text-pink-400">
          {score} <span className="text-white/40">/</span> {total}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          {t(verdictKey)}
        </p>
      </div>
    </div>
  );
}
