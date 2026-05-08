import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const roadmapItems = [
  {
    title: "Stake SOL for 30+ days",
    progress: 67,
    impact: "+4 score",
    detail: "Shows longer-term wallet commitment and balance stability.",
  },
  {
    title: "Repay a loan cleanly",
    progress: 35,
    impact: "+7 score",
    detail: "Adds direct repayment evidence for future lending terms.",
  },
  {
    title: "Vote in governance",
    progress: 20,
    impact: "+2 score",
    detail: "Signals protocol participation beyond passive holding.",
  },
  {
    title: "Keep stable liquidity",
    progress: 82,
    impact: "+3 score",
    detail: "Maintains repayment capacity across market conditions.",
  },
];

export default function RoadmapPage() {
  const completedAverage = Math.round(
    roadmapItems.reduce((total, item) => total + item.progress, 0) / roadmapItems.length,
  );

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
              Credit Improvement Roadmap
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              Personalized actions to raise your score.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
              Turn score factors into a clear checklist with measurable progress and
              expected impact.
            </p>
          </div>
          <section className="rounded-xl border border-[#450041]/18 bg-[#450041]/5 p-5">
            <p className="text-sm font-bold text-[#450041]/65">Roadmap progress</p>
            <p className="mt-3 text-5xl font-black">{completedAverage}%</p>
            <p className="mt-2 text-sm font-bold text-[#00B65C]">Estimated +16 score upside</p>
          </section>
        </div>

        <div className="mt-8 grid gap-4">
          {roadmapItems.map((item) => (
            <article
              className="rounded-xl border border-[#450041]/18 bg-[#FFFFFF] p-5 shadow-[0_16px_50px_rgba(69,0,65,0.08)]"
              key={item.title}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-black">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#450041]/68">{item.detail}</p>
                </div>
                <p className="rounded-full border border-[#00B65C]/35 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#00B65C]">
                  {item.impact}
                </p>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-bold uppercase text-[#450041]/55">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#450041]/12">
                  <div
                    className="h-3 rounded-full bg-[#00B65C]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-[#00B65C] px-5 py-3 text-sm font-black text-[#FFFFFF] transition hover:bg-[#450041]"
            href="/dashboard"
          >
            Refresh Wallet Score
          </Link>
          <Link
            className="rounded-md border border-[#450041]/30 px-5 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
            href="/calculator"
          >
            Simulate Changes
          </Link>
        </div>
      </section>
    </main>
  );
}
