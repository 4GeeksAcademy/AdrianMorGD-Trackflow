import Image from "next/image";
import Link from "next/link";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

const metrics = [
  { value: "+400", label: "Brands supported", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80" },
  { value: "+50k", label: "Shipments delivered successfully", image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80" },
  { value: "98.7%", label: "On-time delivery rate", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80" },
];

const services = [
  { icon: "01", title: "Inventory that moves with you", text: "One view of stock across Los Angeles and Zaragoza, ready for every order." },
  { icon: "02", title: "Smarter carrier decisions", text: "The right carrier for every destination, weight, urgency, and customer promise." },
  { icon: "03", title: "Returns without the friction", text: "A clear, human-friendly returns flow from approval to inspection and restock." },
];

export default function HomePage() {
  const organizationSchema = { "@context": "https://schema.org", "@type": "Organization", name: "TrackFlow", foundingDate: "2009", description: "Warehouse management and last-mile delivery for e-commerce brands.", areaServed: ["United States", "Spain"], location: [{ "@type": "Place", name: "Los Angeles warehouse" }, { "@type": "Place", name: "Zaragoza warehouse" }] };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    <main>
      <section className="relative isolate min-h-[680px] overflow-hidden bg-black text-white">
        <Image src="https://images.unsplash.com/photo-1586528116493-da8b6a4b8b3b?auto=format&fit=crop&w=2200&q=85" alt="TrackFlow warehouse fulfillment operation" fill priority className="object-cover opacity-60" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/80" />
        <Header />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-end px-5 pb-20 pt-36 lg:px-8 lg:pb-28"><div className="max-w-4xl"><p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-mint"><span className="h-px w-10 bg-mint" /> Fulfillment, in motion</p><h1 className="max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-7xl lg:text-8xl">Smarter fulfillment for growing e-commerce brands.</h1><p className="mt-8 max-w-xl text-base leading-7 text-white/75 sm:text-lg">From the first click to the front door — TrackFlow stores, ships, tracks, and returns your products across the US and Spain.</p><Link href="/get-a-quote" className="focus-ring mt-9 inline-flex rounded-full bg-mint px-7 py-4 text-sm font-extrabold text-black transition hover:bg-white">Get a spot quote <span className="ml-3" aria-hidden="true">↗</span></Link></div></div>
      </section>

      <section id="services" className="dot-grid px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.25em] text-black/50">The TrackFlow difference</p><h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-0.04em] sm:text-6xl">Reliable fulfillment for every order, every time.</h2><p className="mt-6 text-lg leading-8 text-slate-600">Your customers expect more than a delivery. They expect certainty. We bring the people, systems, and local expertise to make every shipment feel effortless.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{metrics.map((metric) => <article key={metric.value} className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_40px_rgba(0,0,0,0.08)]"><div className="relative h-52"><Image src={metric.image} alt="Fulfillment operation" fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" /></div><div className="p-6"><p className="text-4xl font-extrabold tracking-[-0.05em]">{metric.value}</p><p className="mt-2 min-h-12 text-sm font-semibold text-slate-500">{metric.label}</p><a href="#why-trackflow" className="focus-ring mt-5 inline-block text-sm font-extrabold underline decoration-mint decoration-2 underline-offset-4">Learn more ↗</a></div></article>)}</div></div></section>

      <section id="why-trackflow" className="bg-black px-5 py-20 text-white lg:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.25em] text-mint">Built for the real world</p><h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.04em] sm:text-6xl">Flexible capacity, on demand.</h2><p className="mt-6 text-lg leading-8 text-white/65">We connect operational precision with a human touch. Whether you are scaling into a new market or preparing for your biggest season yet, your logistics should never be the bottleneck.</p><Link href="/get-a-quote" className="focus-ring mt-8 inline-flex rounded-full bg-mint px-7 py-4 text-sm font-extrabold text-black transition hover:bg-white">Get a spot quote <span className="ml-3" aria-hidden="true">↗</span></Link></div><div className="relative min-h-[420px] overflow-hidden rounded-3xl"><Image src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1300&q=85" alt="Parcel tracking and delivery planning" fill className="object-cover" sizes="(min-width: 1024px) 55vw, 100vw" /><div className="absolute bottom-5 left-5 rounded-2xl bg-white p-5 text-black shadow-xl"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Live network</p><p className="mt-1 text-xl font-extrabold">LA · Zaragoza · Everywhere</p></div></div></div></section>

      <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.25em] text-black/50">One connected operation</p><h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">Logistics that works<br className="hidden sm:block" /> as one.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">A better view of what is happening now, and a clearer path to what happens next.</p></div><div className="mt-12 grid gap-4 md:grid-cols-3">{services.map((service) => <article key={service.icon} className="rounded-3xl border border-slate-200 p-7"><span className="text-sm font-extrabold text-mint">{service.icon}</span><h3 className="mt-14 text-2xl font-extrabold tracking-tight">{service.title}</h3><p className="mt-4 leading-7 text-slate-500">{service.text}</p></article>)}</div></div></section>

      <Footer />
    </main>
  </>;
}
