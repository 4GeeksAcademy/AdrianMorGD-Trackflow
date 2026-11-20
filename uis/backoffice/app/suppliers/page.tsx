"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Supplier = {
  id: number;
  name: string;
  country: string;
  product_categories: string[];
  rate: number;
  status: "active" | "suspended";
};

const COUNTRIES = ["United States", "Spain"];
const CATEGORIES = ["Fashion", "Electronics", "Cosmetics", "Home", "Other"];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [updatingRateId, setUpdatingRateId] = useState<number | null>(null);
  const [rateUpdateError, setRateUpdateError] = useState<{ supplierId: number; message: string } | null>(null);
  const [rateUpdateSuccessId, setRateUpdateSuccessId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<{ supplierId: number; message: string } | null>(null);
  const [statusUpdateSuccessId, setStatusUpdateSuccessId] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) =>
    (!countryFilter || supplier.country === countryFilter)
    && (!categoryFilter || supplier.product_categories.includes(categoryFilter)),
  );

  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/suppliers", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load suppliers (HTTP ${response.status}).`);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("The supplier API returned an unexpected response.");
      setSuppliers(data as Supplier[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to connect to the supplier API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function registerSupplier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistrationError("");
    setRegistrationSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      country: String(formData.get("country") ?? ""),
      product_categories: selectedCategories,
      rate: Number(formData.get("rate")),
      status: String(formData.get("status") ?? "active"),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = `The API rejected this supplier (HTTP ${response.status}).`;
        try {
          const body: unknown = await response.json();
          if (typeof body === "object" && body !== null && "detail" in body) {
            const detail = body.detail;
            if (typeof detail === "string") {
              message = detail;
            } else if (Array.isArray(detail)) {
              message = detail
                .map((item) => typeof item === "object" && item !== null && "msg" in item
                  ? String(item.msg)
                  : String(item))
                .join(" ");
            }
          }
        } catch {
          // Keep the HTTP status message when the API response is not JSON.
        }
        throw new Error(message);
      }

      const created: Supplier = await response.json();
      setSuppliers((current) => [...current, created]);
      setSelectedCategories([]);
      setRegistrationSuccess(`${created.name} was registered successfully.`);
      form.reset();
    } catch (caught) {
      setRegistrationError(caught instanceof Error
        ? caught.message
        : "Unable to connect to the supplier API. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateSupplierRate(
    event: React.FormEvent<HTMLFormElement>,
    supplierId: number,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rate = Number(formData.get("rate"));
    setUpdatingRateId(supplierId);
    setRateUpdateError(null);
    setRateUpdateSuccessId(null);

    try {
      const response = await fetch(`/api/suppliers/${supplierId}/rate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate }),
      });

      if (!response.ok) {
        let message = `The API rejected this rate (HTTP ${response.status}).`;
        try {
          const body: unknown = await response.json();
          if (typeof body === "object" && body !== null && "detail" in body) {
            const detail = body.detail;
            if (typeof detail === "string") {
              message = detail;
            } else if (Array.isArray(detail)) {
              message = detail
                .map((item) => typeof item === "object" && item !== null && "msg" in item
                  ? String(item.msg)
                  : String(item))
                .join(" ");
            }
          }
        } catch {
          // Keep the HTTP status message when the API response is not JSON.
        }
        throw new Error(message);
      }

      const updated: Supplier = await response.json();
      setSuppliers((current) => current.map((supplier) =>
        supplier.id === supplierId ? updated : supplier,
      ));
      setRateUpdateSuccessId(supplierId);
    } catch (caught) {
      setRateUpdateError({
        supplierId,
        message: caught instanceof Error
          ? caught.message
          : "Unable to connect to the supplier API. Please try again.",
      });
    } finally {
      setUpdatingRateId(null);
    }
  }

  async function toggleSupplierStatus(supplier: Supplier) {
    const nextStatus = supplier.status === "active" ? "suspended" : "active";
    setUpdatingStatusId(supplier.id);
    setStatusUpdateError(null);
    setStatusUpdateSuccessId(null);

    try {
      const response = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        let message = `The API rejected the status change (HTTP ${response.status}).`;
        try {
          const body: unknown = await response.json();
          if (typeof body === "object" && body !== null && "detail" in body) {
            const detail = body.detail;
            if (typeof detail === "string") {
              message = detail;
            } else if (Array.isArray(detail)) {
              message = detail
                .map((item) => typeof item === "object" && item !== null && "msg" in item
                  ? String(item.msg)
                  : String(item))
                .join(" ");
            }
          }
        } catch {
          // Keep the HTTP status message when the API response is not JSON.
        }
        throw new Error(message);
      }

      const updated: Supplier = await response.json();
      setSuppliers((current) => current.map((item) =>
        item.id === supplier.id ? updated : item,
      ));
      setStatusUpdateSuccessId(supplier.id);
    } catch (caught) {
      setStatusUpdateError({
        supplierId: supplier.id,
        message: caught instanceof Error
          ? caught.message
          : "Unable to connect to the supplier API. Please try again.",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchInitialSuppliers() {
      try {
        const response = await fetch("/api/suppliers", { cache: "no-store" });
        if (!response.ok) throw new Error(`Unable to load suppliers (HTTP ${response.status}).`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("The supplier API returned an unexpected response.");
        if (!cancelled) setSuppliers(data as Supplier[]);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Unable to connect to the supplier API.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void fetchInitialSuppliers();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-navy p-5 text-white lg:flex lg:min-h-screen lg:w-72 lg:flex-col lg:p-7">
        <Link href="/" className="flex items-center gap-3" aria-label="TrackFlow home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint font-bold text-black">▦</span>
          <span><span className="block font-extrabold tracking-[0.12em]">TRACKFLOW</span><span className="text-xs text-white/50">Operations workspace</span></span>
        </Link>
        <nav className="mt-10 flex gap-2 overflow-x-auto lg:block" aria-label="Operations navigation">
          <Link href="/" className="mb-2 block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white">Overview</Link>
          <Link href="/suppliers" aria-current="page" className="mb-2 block whitespace-nowrap rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-mint">Supplier directory</Link>
          <Link href="/incidents" className="mb-2 block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white">Incident analysis</Link>
        </nav>
        <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
          <p className="text-xs uppercase tracking-widest text-white/40">Supplier network</p>
          <p className="mt-3 text-sm font-bold">{suppliers.length} listed suppliers</p>
          <p className="mt-2 text-xs leading-5 text-white/50">Supplier information from the TrackFlow operations API.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-12">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-slate-400">OPERATIONS / SUPPLIERS</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Supplier directory</h1>
            <p className="mt-3 max-w-2xl text-slate-500">Browse the complete supplier network, including regions, product categories, rates, and current status.</p>
          </div>
          <button type="button" onClick={() => void loadSuppliers()} disabled={isLoading} className="focus-ring inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">
            {isLoading ? "Refreshing…" : "Refresh directory"}
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="register-supplier-title">
          <div className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">New supplier</p>
            <h2 id="register-supplier-title" className="mt-1 text-xl font-extrabold">Register a supplier</h2>
            <p className="mt-2 text-sm text-slate-500">Add supplier details to the operations directory.</p>
          </div>
          <form onSubmit={registerSupplier} className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Supplier name
              <input name="name" type="text" required maxLength={120} className="focus-ring mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium" placeholder="e.g. Northstar Textiles" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Country
              <select name="country" required defaultValue="" className="focus-ring mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium">
                <option value="" disabled>Select a country</option>
                {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </label>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-bold text-slate-700">Product categories</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <label key={category} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(event) => setSelectedCategories((current) => event.target.checked
                        ? [...current, category]
                        : current.filter((item) => item !== category))}
                      className="accent-emerald-700"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-bold text-slate-700">
              Rate
              <input name="rate" type="number" required min="0.01" step="any" className="focus-ring mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium" placeholder="e.g. 2.50" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Status
              <select name="status" defaultValue="active" className="focus-ring mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
            <div className="md:col-span-2">
              {registrationError && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800" role="alert">{registrationError}</p>}
              {registrationSuccess && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">{registrationSuccess}</p>}
              <button type="submit" disabled={isSubmitting} className="focus-ring rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">
                {isSubmitting ? "Registering…" : "Register supplier"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="supplier-list-title">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Supplier network</p>
              <h2 id="supplier-list-title" className="mt-1 text-xl font-extrabold">All suppliers</h2>
            </div>
            {!isLoading && !error && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{filteredSuppliers.length} {filteredSuppliers.length === 1 ? "supplier" : "suppliers"}</span>}
          </div>

          <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:px-6">
            <label className="block text-sm font-bold text-slate-700">
              Country
              <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className="focus-ring mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                <option value="">All countries</option>
                {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Category
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="focus-ring mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                <option value="">All categories</option>
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => { setCountryFilter(""); setCategoryFilter(""); }} disabled={!countryFilter && !categoryFilter} className="focus-ring rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Clear filters</button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-sm font-medium text-slate-500" role="status">Loading suppliers…</div>
          ) : error ? (
            <div className="p-6" role="alert">
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</p>
              <button type="button" onClick={() => void loadSuppliers()} className="focus-ring mt-4 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-white">Try again</button>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-bold text-slate-700">No suppliers yet</p>
              <p className="mt-2 text-sm text-slate-500">Suppliers will appear here once they are registered.</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-bold text-slate-700">No suppliers match these filters</p>
              <p className="mt-2 text-sm text-slate-500">Try another country or category, or clear the filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-extrabold">Name</th>
                    <th scope="col" className="px-6 py-4 font-extrabold">Country</th>
                    <th scope="col" className="px-6 py-4 font-extrabold">Categories</th>
                    <th scope="col" className="px-6 py-4 text-right font-extrabold">Rate</th>
                    <th scope="col" className="px-6 py-4 font-extrabold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className={`transition hover:bg-slate-50/80 ${supplier.status === "suspended" ? "border-b-2 border-amber-100" : ""}`}>
                      <th scope="row" className="whitespace-nowrap px-6 py-5 font-bold text-navy">{supplier.name}</th>
                      <td className="whitespace-nowrap px-6 py-5 text-slate-600">{supplier.country}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {supplier.product_categories.length ? supplier.product_categories.map((category) => <span key={category} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{category}</span>) : <span className="text-slate-400">—</span>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <form onSubmit={(event) => void updateSupplierRate(event, supplier.id)} className="flex items-center justify-end gap-2">
                          <label className="sr-only" htmlFor={`supplier-rate-${supplier.id}`}>Rate for {supplier.name}</label>
                          <input
                            id={`supplier-rate-${supplier.id}`}
                            name="rate"
                            type="number"
                            required
                            min="0.01"
                            step="any"
                            defaultValue={supplier.rate}
                            className="focus-ring w-28 rounded-lg border border-slate-200 px-2.5 py-2 text-right font-semibold text-slate-700"
                          />
                          <button
                            type="submit"
                            disabled={updatingRateId !== null}
                            className="focus-ring rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60"
                          >
                            {updatingRateId === supplier.id ? "Saving…" : "Update"}
                          </button>
                        </form>
                        {rateUpdateError?.supplierId === supplier.id && <p className="mt-2 max-w-48 whitespace-normal text-right text-xs font-semibold text-rose-700" role="alert">{rateUpdateError.message}</p>}
                        {rateUpdateSuccessId === supplier.id && <p className="mt-2 text-right text-xs font-semibold text-emerald-700" role="status">Rate updated</p>}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize ${supplier.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${supplier.status === "active" ? "bg-emerald-600" : "bg-amber-600"}`} />
                            {supplier.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => void toggleSupplierStatus(supplier)}
                            disabled={updatingStatusId !== null}
                            aria-label={`${supplier.status === "active" ? "Suspend" : "Activate"} ${supplier.name}`}
                            className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                          >
                            {updatingStatusId === supplier.id
                              ? "Updating…"
                              : supplier.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                        {statusUpdateError?.supplierId === supplier.id && <p className="mt-2 max-w-48 whitespace-normal text-xs font-semibold text-rose-700" role="alert">{statusUpdateError.message}</p>}
                        {statusUpdateSuccessId === supplier.id && <p className="mt-2 text-xs font-semibold text-emerald-700" role="status">Status updated</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p className="mt-4 text-xs text-slate-400">Rates are displayed as provided by the supplier record; the API does not currently specify a currency or pricing unit.</p>
      </main>
    </div>
  );
}
