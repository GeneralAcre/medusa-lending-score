"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Profile", href: "/dashboard" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Badge", href: "/badge" },
  { label: "Simulator", href: "/calculator" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-[#450041]/15 bg-[#FFFFFF]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-6 lg:px-8">
        <Link className="flex items-center" href="/" onClick={() => setIsOpen(false)}>
          <Image
            alt="Solana Trust Medusa logo"
            className="h-auto w-44 sm:w-52"
            height={99}
            priority
            src="/medusa-logo.png"
            width={380}
          />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-4 py-2 text-sm font-bold text-[#450041] transition hover:bg-[#450041]/5 hover:text-[#00B65C]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <WalletMultiButton />
        </div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="grid h-10 w-10 place-items-center rounded-md border border-[#450041]/25 text-[#450041] md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span className="relative block h-4 w-5">
            <span className="absolute left-0 top-0 h-0.5 w-5 bg-current" />
            <span className="absolute left-0 top-[7px] h-0.5 w-5 bg-current" />
            <span className="absolute bottom-0 left-0 h-0.5 w-5 bg-current" />
          </span>
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-[#450041]/15 px-6 pb-5 pt-3 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <Link
                className="rounded-md border border-[#450041]/15 px-4 py-3 text-sm font-bold text-[#450041] transition hover:border-[#00B65C] hover:text-[#00B65C]"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="wallet-header-mobile">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
