"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
  { label: "Services", href: "#services" },
  { label: "Coverage", href: "#coverage" },
  { label: "Why TrackFlow", href: "#why-trackflow" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="focus-ring flex items-center gap-3 text-white" aria-label="TrackFlow home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm text-black" aria-hidden="true">▦</span>
          <span className="font-extrabold tracking-[0.15em]">TRACKFLOW</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => <a className="focus-ring text-sm font-semibold text-white transition hover:text-mint" href={item.href} key={item.href}>{item.label}</a>)}
          <Link href="/get-a-quote" className="focus-ring rounded-full bg-mint px-5 py-3 text-sm font-extrabold text-black transition hover:bg-white">Get a spot quote</Link>
        </div>

        <button type="button" className="focus-ring flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-black/30 text-xl text-white md:hidden" aria-label="Toggle navigation menu" aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)}>
          {isOpen ? "×" : "☰"}
        </button>
      </nav>

      {isOpen && <div className="mx-4 rounded-2xl bg-black/95 p-5 shadow-2xl md:hidden">
        <div className="flex flex-col gap-4">{navigation.map((item) => <a className="focus-ring rounded-lg py-2 font-semibold text-white" href={item.href} key={item.href} onClick={() => setIsOpen(false)}>{item.label}</a>)}<Link href="/get-a-quote" className="rounded-full bg-mint px-5 py-3 text-center font-extrabold text-black">Get a spot quote</Link></div>
      </div>}
    </header>
  );
}
