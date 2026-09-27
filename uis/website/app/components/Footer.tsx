import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="bg-black px-5 py-12 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div><Link href="/" className="font-extrabold tracking-[0.15em]">TRACKFLOW</Link><p className="mt-3 max-w-sm text-sm leading-6 text-white/60">The logistics infrastructure behind ambitious e-commerce brands.</p></div>
        <div className="flex gap-3" aria-label="Social media links"><a href="#contact" aria-label="LinkedIn" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm hover:border-mint hover:text-mint">in</a><a href="#contact" aria-label="Instagram" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm hover:border-mint hover:text-mint">◎</a><a href="#contact" aria-label="X" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm hover:border-mint hover:text-mint">𝕏</a></div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/40">© 2026 TrackFlow. Los Angeles · Zaragoza.</div>
    </footer>
  );
}
