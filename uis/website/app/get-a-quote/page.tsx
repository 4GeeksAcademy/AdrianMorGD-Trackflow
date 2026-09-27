"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function GetAQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") ?? "");
    if (!/^\d{7,15}$/.test(phone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    setPhoneError("");
    setSubmitted(true);
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 py-12 text-white"><Image src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=2200&q=85" alt="Packages ready for delivery" fill className="object-cover opacity-45" sizes="100vw" /><div className="absolute inset-0 bg-black/60" /><div className="relative z-10 w-full max-w-2xl"><Link href="/" className="focus-ring mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-mint">← Back to TrackFlow</Link><section className="rounded-3xl border border-white/30 bg-black/45 p-7 shadow-2xl backdrop-blur-xl sm:p-12"><p className="text-xs font-extrabold uppercase tracking-[0.25em] text-mint">Start a conversation</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">Get a quote.</h1><p className="mt-5 max-w-lg leading-7 text-white/70">Unlock your full delivery potential and get to know us. Tell us a little about your operation and our team will be in touch.</p>{submitted ? <div className="mt-8 rounded-2xl bg-mint p-5 font-bold text-black" role="status">Thanks — your request is ready for our team.</div> : <form className="mt-8 space-y-5" onSubmit={handleSubmit}><div><label htmlFor="email" className="sr-only">Email</label><input id="email" name="email" type="email" required placeholder="Email" className="focus-ring w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder:text-white/50" /></div><div><label htmlFor="phone" className="mb-2 block text-sm font-semibold">Phone number</label><div className="flex gap-3"><select aria-label="Country code" name="countryCode" className="focus-ring w-28 rounded-xl border border-white/20 bg-white/10 px-3 py-4 text-white"><option className="text-black">🇺🇸 +1</option><option className="text-black">🇪🇸 +34</option><option className="text-black">🇲🇽 +52</option></select><input id="phone" name="phone" inputMode="numeric" pattern="[0-9]{7,15}" placeholder="Phone number" required className="focus-ring min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder:text-white/50" /></div>{phoneError && <p className="mt-2 text-sm text-red-300" role="alert">{phoneError}</p>}</div><div><label htmlFor="company" className="sr-only">Company name</label><input id="company" name="company" placeholder="Company name" required className="focus-ring w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder:text-white/50" /></div><button type="submit" className="focus-ring w-full rounded-full bg-mint px-6 py-4 font-extrabold text-black transition hover:bg-white">Get started <span aria-hidden="true">↗</span></button></form>}</section></div></main>;
}
