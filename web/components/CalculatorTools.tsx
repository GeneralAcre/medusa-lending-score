"use client";

import { useState } from "react";

const simulatorActions = [
  {
    id: "stake",
    label: "Stake SOL",
    impact: 4,
    detail: "Adds commitment and collateral context.",
  },
  {
    id: "repay",
    label: "Repay a loan",
    impact: 7,
    detail: "Improves repayment behavior signal.",
  },
  {
    id: "hold",
    label: "Hold 30 days",
    impact: 3,
    detail: "Increases wallet age and consistency.",
  },
  {
    id: "liquidity",
    label: "Keep token liquidity",
    impact: 2,
    detail: "Strengthens short-term repayment capacity.",
  },
] as const;

const partnerRates = [
  { name: "Solend", baseApr: 13.9, primeDiscount: 3.2, reliableDiscount: 2.1, emergingDiscount: 0.8 },
  { name: "Kamino", baseApr: 12.8, primeDiscount: 2.6, reliableDiscount: 1.7, emergingDiscount: 0.6 },
  { name: "MarginFi", baseApr: 14.4, primeDiscount: 3.5, reliableDiscount: 2.3, emergingDiscount: 0.9 },
] as const;

export function CalculatorTools() {
  const [baseScore, setBaseScore] = useState(58);
  const [selectedActions, setSelectedActions] = useState<string[]>(["stake", "repay"]);
  const simulatedScore = clampScore(
    baseScore +
      simulatorActions
        .filter((action) => selectedActions.includes(action.id))
        .reduce((total, action) => total + action.impact, 0),
  );
  const rateRows = partnerRates.map((partner) => {
    const current = rateForScore(partner, baseScore);
    const simulated = rateForScore(partner, simulatedScore);

    return {
      ...partner,
      current,
      simulated,
      savings: Math.max(0, current - simulated),
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Score Simulator</h2>
            <p className="mt-1 text-sm leading-6 text-[#450041]/65">
              Preview how staking, repayment, and stronger wallet history can affect a score.
            </p>
          </div>
          <span className="rounded-md border border-[#00B65C] px-3 py-1 text-xs font-bold text-[#00B65C]">
            What if
          </span>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-black text-[#450041]">Current score</span>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-[#450041]/20 bg-[#FFFFFF] px-4 text-[#450041] outline-none focus:border-[#00B65C]"
            max={98}
            min={8}
            onChange={(event) => setBaseScore(clampScore(Number(event.target.value) || 8))}
            type="number"
            value={baseScore}
          />
        </label>

        <div className="mt-5 grid gap-3">
          {simulatorActions.map((action) => {
            const isChecked = selectedActions.includes(action.id);

            return (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#450041]/14 bg-[#FFFFFF] p-4"
                key={action.id}
              >
                <input
                  checked={isChecked}
                  className="mt-1 h-4 w-4 accent-[#00B65C]"
                  onChange={() => {
                    setSelectedActions((current) =>
                      current.includes(action.id)
                        ? current.filter((id) => id !== action.id)
                        : [...current, action.id],
                    );
                  }}
                  type="checkbox"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#450041]">{action.label}</span>
                    <span className="text-sm font-black text-[#00B65C]">+{action.impact}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[#450041]/65">
                    {action.detail}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border border-[#00B65C]/40 bg-[#00B65C]/10 p-4 sm:grid-cols-2">
          <Metric label="Current score" value={String(baseScore)} />
          <Metric label="Simulated score" value={String(simulatedScore)} />
        </div>
      </section>

      <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-6 shadow-[0_20px_70px_rgba(69,0,65,0.10)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">DeFi Rate Calculator</h2>
            <p className="mt-1 text-sm leading-6 text-[#450041]/65">
              Compare score-tier APR differences across configured lending partners.
            </p>
          </div>
          <span className="rounded-md border border-[#00B65C] px-3 py-1 text-xs font-bold text-[#00B65C]">
            Tier based
          </span>
        </div>

        <div className="mt-5 divide-y divide-[#450041]/12 rounded-lg border border-[#450041]/14 bg-[#FFFFFF]">
          {rateRows.map((row) => (
            <div className="grid gap-3 p-4 sm:grid-cols-[1fr_110px_110px]" key={row.name}>
              <div>
                <p className="text-sm font-black text-[#450041]">{row.name}</p>
                <p className="mt-1 text-xs leading-5 text-[#450041]/60">
                  Score {simulatedScore} saves {row.savings.toFixed(1)}% APR versus the
                  current tier estimate.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-[#450041]/50">Current</p>
                <p className="mt-1 text-lg font-black text-[#450041]">
                  {row.current.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-[#450041]/50">Simulated</p>
                <p className="mt-1 text-lg font-black text-[#00B65C]">
                  {row.simulated.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#450041]/55">
          Rates are partner-tier estimates in this build. Connect live protocol rate APIs
          before displaying them as executable loan offers.
        </p>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#450041]/18 bg-[#FFFFFF] p-4">
      <p className="text-xs font-bold uppercase text-[#450041]/55">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-[#00B65C]">{value}</p>
    </div>
  );
}

function clampScore(value: number) {
  return Math.max(8, Math.min(98, value));
}

function rateForScore(partner: (typeof partnerRates)[number], score: number) {
  if (score >= 82) return partner.baseApr - partner.primeDiscount;
  if (score >= 68) return partner.baseApr - partner.reliableDiscount;
  if (score >= 52) return partner.baseApr - partner.emergingDiscount;
  return partner.baseApr;
}
