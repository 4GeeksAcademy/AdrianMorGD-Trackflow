"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  addCandidateNote,
  deleteCandidateNote,
  getCandidateById,
  getCandidateNotes,
  patchCandidate,
  updateCandidate,
} from "../../../lib/api";
import {
  stageLabels,
  stageOptions,
  statusLabels,
  statusOptions,
  type Candidate,
  type CandidateFormValues,
  type CandidateNote,
} from "../../../types/candidate";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [form, setForm] = useState<CandidateFormValues | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCandidate() {
      try {
        setLoading(true);
        setError(null);
        const [detail, detailNotes] = await Promise.all([
          getCandidateById(id),
          getCandidateNotes(id),
        ]);

        if (!ignore) {
          setCandidate(detail);
          setNotes(detailNotes);
          setForm(
            detail
              ? {
                  name: detail.name,
                  email: detail.email,
                  phone: detail.phone ?? "",
                  position: detail.position,
                  linkedin: detail.linkedin ?? "",
                  cvUrl: detail.cvUrl ?? "",
                  yearsExperience: String(detail.yearsExperience ?? ""),
                  status: detail.status,
                  stage: detail.stage,
                }
              : null,
          );
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Unable to load the candidate profile.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadCandidate();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as Candidate["status"];
    if (!candidate || !status) return;

    setIsUpdating(true);
    try {
      const updated = await patchCandidate(candidate.id, { status });
      setCandidate((current) => (current ? { ...current, status: updated.status } : current));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stage = event.target.value as Candidate["stage"];
    if (!candidate || !stage) return;

    setIsUpdating(true);
    try {
      const updated = await patchCandidate(candidate.id, { stage });
      setCandidate((current) => (current ? { ...current, stage: updated.stage } : current));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!candidate || !noteText.trim()) return;

    setIsSavingNote(true);
    try {
      const newNote = await addCandidateNote(candidate.id, noteText.trim());
      setNotes((current) => [newNote, ...current]);
      setNoteText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!candidate) return;

    try {
      await deleteCandidateNote(candidate.id, noteId);
      setNotes((current) => current.filter((note) => note.id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (!current) return current;
      return { ...current, [name]: value };
    });
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!candidate || !form) {
      return;
    }

    if (!form.name || !form.email || !form.position) {
      setFormError("Name, email, and position are required.");
      return;
    }

    setIsSavingProfile(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const updated = await updateCandidate(candidate.id, {
        ...form,
        yearsExperience: Number(form.yearsExperience || 0),
      });

      setCandidate(updated);
      setForm({
        name: updated.name,
        email: updated.email,
        phone: updated.phone ?? "",
        position: updated.position,
        linkedin: updated.linkedin ?? "",
        cvUrl: updated.cvUrl ?? "",
        yearsExperience: String(updated.yearsExperience ?? ""),
        status: updated.status,
        stage: updated.stage,
      });
      setFormSuccess("Candidate details updated successfully.");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to update candidate.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-300">Loading candidate details...</div>;
  }

  if (error || !candidate) {
    return (
      <main className="p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
          {error || "Candidate not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-blue-300 hover:text-blue-200">
            ← Back to pipeline
          </Link>
        </div>

        <header className="card rounded-2xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Candidate profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{candidate.name}</h1>
            </div>
            <div className="flex gap-3">
              <select
                value={candidate.status}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={candidate.stage}
                onChange={handleStageChange}
                disabled={isUpdating}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="card rounded-2xl p-5">
              <h2 className="text-xl font-semibold text-white">Candidate information</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoRow label="Email" value={candidate.email} />
                <InfoRow label="Phone" value={candidate.phone || "Not provided"} />
                <InfoRow label="Position" value={candidate.position} />
                <InfoRow label="Experience" value={`${candidate.yearsExperience ?? 0} years`} />
                <InfoRow label="LinkedIn" value={candidate.linkedin || "Not provided"} />
                <InfoRow label="CV" value={candidate.cvUrl || "Not provided"} />
                <InfoRow label="Status" value={statusLabels[candidate.status]} />
                <InfoRow label="Stage" value={stageLabels[candidate.stage]} />
                <InfoRow label="Application date" value={candidate.applicationDate} />
              </div>
            </div>

            <div className="card rounded-2xl p-5">
              <h2 className="text-xl font-semibold text-white">Edit candidate</h2>

              {form && (
                <form onSubmit={handleProfileSubmit} className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Full name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Position *</label>
                      <input
                        name="position"
                        value={form.position}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Years of experience</label>
                      <input
                        type="number"
                        name="yearsExperience"
                        value={form.yearsExperience}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Phone</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">LinkedIn</label>
                      <input
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleProfileChange}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-300">CV link</label>
                    <input
                      name="cvUrl"
                      value={form.cvUrl}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm text-slate-300">Status</label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleProfileChange}
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
                        onChange={handleProfileChange}
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

                  {formError ? (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                      {formError}
                    </div>
                  ) : null}
                  {formSuccess ? (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                      {formSuccess}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingProfile ? "Saving changes..." : "Save profile"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <aside className="card rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-white">Internal notes</h2>
            <div className="mt-4 space-y-3">
              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                rows={4}
                placeholder="Add an internal note about this candidate..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={isSavingNote || !noteText.trim()}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingNote ? "Saving note..." : "Add note"}
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-slate-400">No notes yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-200">{note.text}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-xs text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
