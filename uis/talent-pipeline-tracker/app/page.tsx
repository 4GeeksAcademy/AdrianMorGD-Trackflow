"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createCandidate, getCandidates } from "../lib/api";
import { emptyCandidateForm } from "../lib/mock-data";
import {
  stageLabels,
  stageOptions,
  statusLabels,
  statusOptions,
  type Candidate,
  type CandidateFormValues,
} from "../types/candidate";

const initialCandidateForm: CandidateFormValues = { ...emptyCandidateForm };

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-300">Loading candidate pipeline...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statusFilter = searchParams.get("status") ?? "all";
  const stageFilter = searchParams.get("stage") ?? "all";
  const searchTerm = searchParams.get("q") ?? "";
  const [form, setForm] = useState<CandidateFormValues>(initialCandidateForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const updateQuery = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    const target = nextParams.toString();
    router.replace(target ? `${pathname}?${target}` : pathname, { scroll: false });
  };

  useEffect(() => {
    let ignore = false;

    async function loadCandidates() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCandidates();
        if (!ignore) setCandidates(data);
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Unable to load the candidate pipeline right now.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadCandidates();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
      const matchesStage = stageFilter === "all" || candidate.stage === stageFilter;
      const haystack = `${candidate.name} ${candidate.email}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesStage && matchesSearch;
    });
  }, [candidates, searchTerm, stageFilter, statusFilter]);

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.position) {
      setSubmitMessage("Please complete the required fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const created = await createCandidate({
        ...form,
        yearsExperience: Number(form.yearsExperience || 0),
      });

      setCandidates((current) => [created, ...current.filter((candidate) => candidate.id !== created.id)]);
      setForm(initialCandidateForm);
      setSubmitMessage("Candidate added successfully.");
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : "Candidate could not be added.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="card rounded-2xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">
                TrackFlow • People & Talent
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Candidate pipeline</h1>
            </div>
            <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
              {candidates.length} active candidates
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card rounded-2xl p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Pipeline overview</h2>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={searchTerm}
                  onChange={(event) => updateQuery("q", event.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0 md:w-64"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => updateQuery("status", event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="all">All status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <select
                  value={stageFilter}
                  onChange={(event) => updateQuery("stage", event.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="all">All stages</option>
                  {stageOptions.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-8 text-center text-slate-300">
                Loading candidates...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-8 text-center text-slate-300">
                No candidates match the current filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCandidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="block rounded-xl border border-slate-700 bg-slate-900/70 p-4 transition hover:border-blue-500/60 hover:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                          <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-300">
                            {statusLabels[candidate.status]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{candidate.position}</p>
                        <p className="mt-1 text-xs text-slate-400">{candidate.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1">
                          Stage: {stageLabels[candidate.stage]}
                        </span>
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1">
                          {candidate.yearsExperience ?? 0} yrs experience
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="card rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-white">Add candidate</h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Full name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Position *</label>
                <input
                  name="position"
                  value={form.position}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Years of experience</label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={form.yearsExperience}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">LinkedIn</label>
                <input
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">CV link</label>
                <input
                  name="cvUrl"
                  value={form.cvUrl}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Stage</label>
                  <select
                    name="stage"
                    value={form.stage}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  >
                    {stageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {submitMessage ? (
                <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-100">
                  {submitMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Add candidate"}
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
