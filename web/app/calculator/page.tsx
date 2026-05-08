import { CalculatorTools } from "@/components/CalculatorTools";
import { SiteHeader } from "@/components/SiteHeader";

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
            Score
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Score Simulator and DeFi Rate Calculator
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
            Estimate how borrower actions can move a score, then compare score-tier APR
            differences across configured DeFi lending partners.
          </p>
        </div>
        <CalculatorTools />
      </section>
    </main>
  );
}
