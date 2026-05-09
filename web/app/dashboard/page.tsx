import { ProfileClient } from "@/components/ProfileClient";
import { SiteHeader } from "@/components/SiteHeader";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#450041]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00B65C]">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            See wallet identity and credibility.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#450041]/70 sm:text-base sm:leading-7">
            Load a Solana wallet to review its credibility score, account activity, risk
            signals, and earned Medusa badge.
          </p>
        </div>
        <ProfileClient />
      </section>
    </main>
  );
}
