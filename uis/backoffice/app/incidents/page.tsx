"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

type Breakdown = Record<string, { count: number; percentage?: number }>;
type AnalysisReport = {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  invalid_breakdown: Record<string, { description: string; count: number }>;
  category_breakdown: Breakdown;
  status_breakdown: Breakdown;
  country_breakdown: Breakdown;
  satisfaction: {
    scored_closed_incidents: number;
    closed_incidents: number;
    average_score: number | null;
    score_breakdown: Record<string, number>;
  };
};

const API_BASE_URL = "";
const EMPTY_FILE_MESSAGE = "Choose a CSV file to analyze.";

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = body.detail;
    if (typeof detail === "string") return detail;
    if (typeof detail === "object" && detail !== null && "message" in detail && typeof detail.message === "string") {
      return detail.message;
    }
  }
  return fallback;
}

function MetricCard({ label, value, detail, accent = "text-navy" }: { label: string; value: string | number; detail: string; accent?: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-4 text-3xl font-extrabold tracking-tight ${accent}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

function BreakdownList({ title, values, emptyLabel }: { title: string; values: Breakdown; emptyLabel: string }) {
  const entries = Object.entries(values);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {entries.length ? (
        <ul className="mt-5 space-y-4">
          {entries.map(([name, item]) => (
            <li key={name}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-600">{name.replaceAll("_", " ")}</span>
                <span className="font-bold">{item.count}{item.percentage !== undefined ? ` · ${item.percentage}%` : ""}</span>
              </div>
              {item.percentage !== undefined && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm text-slate-400">{emptyLabel}</p>}
    </section>
  );
}

export default function IncidentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function selectFile(candidate: File | undefined) {
    setError("");
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setReport(null);
      setError("That file does not have a .csv extension. Select an incidents CSV file.");
      return;
    }
    setFile(candidate);
    setReport(null);
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function analyzeFile() {
    if (!file) {
      setError(EMPTY_FILE_MESSAGE);
      return;
    }
    setIsLoading(true);
    setError("");
    setReport(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/api/incidents/analyze`, { method: "POST", body: formData });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getErrorMessage(body, `The API returned HTTP ${response.status}.`));
      setReport(body as AnalysisReport);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to connect to the analysis API.");
    } finally {
      setIsLoading(false);
    }
  }

  const invalidRules = report ? Object.entries(report.invalid_breakdown).filter(([, item]) => item.count > 0) : [];

  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-navy p-5 text-white lg:flex lg:min-h-screen lg:w-72 lg:flex-col lg:p-7">
        <Link href="/" className="flex items-center gap-3" aria-label="TrackFlow home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint font-bold text-black">▦</span>
          <span><span className="block font-extrabold tracking-[0.12em]">TRACKFLOW</span><span className="text-xs text-white/50">Operations workspace</span></span>
        </Link>
        <nav className="mt-10 flex gap-2 overflow-x-auto lg:block" aria-label="Operations navigation">
          <Link href="/" className="mb-2 block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white">Overview</Link>
          <Link href="/incidents" aria-current="page" className="mb-2 block whitespace-nowrap rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-mint">Incident analysis</Link>
        </nav>
        <div className="mt-auto hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:block">
          <p className="text-xs uppercase tracking-widest text-white/40">Data privacy</p>
          <p className="mt-3 text-sm font-bold">Customer emails are never shown</p>
          <p className="mt-2 text-xs leading-5 text-white/50">Only aggregate analysis metrics are returned or exported.</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-12">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-slate-400">OPERATIONS / INCIDENTS</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Incident analysis</h1>
            <p className="mt-3 max-w-2xl text-slate-500">Upload an incidents CSV to review quality, categories, status, and customer satisfaction.</p>
          </div>
          {report && (
            <a href={`${API_BASE_URL}/api/incidents/results/export`} className="focus-ring inline-flex items-center justify-center rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700">
              Download results CSV <span aria-hidden="true" className="ml-2">↓</span>
            </a>
          )}
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="upload-title">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">CSV report</p>
            <h2 id="upload-title" className="mt-2 text-xl font-extrabold">Upload incident data</h2>
            <p className="mt-2 text-sm text-slate-500">CSV format · Maximum file size 10 MiB</p>
          </div>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={onFileInputChange} aria-label="Choose incidents CSV file" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current?.click(); } }}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={onDrop}
            className={`focus-ring mt-6 cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition sm:p-10 ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40"}`}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700" aria-hidden="true">↑</span>
            <p className="mt-4 font-bold">{file ? file.name : "Drop your CSV file here"}</p>
            <p className="mt-2 text-sm text-slate-500">{file ? `${(file.size / 1024).toFixed(1)} KB · Click to select another file` : "or click to browse files"}</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={analyzeFile} disabled={isLoading} className="focus-ring rounded-xl bg-emerald-400 px-5 py-3 text-sm font-extrabold text-navy transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60">
              {isLoading ? "Analyzing…" : "Analyze incidents"}
            </button>
            {file && <button type="button" onClick={() => { setFile(null); setReport(null); setError(""); if (inputRef.current) inputRef.current.value = ""; }} className="focus-ring rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100">Remove file</button>}
          </div>
          {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div>}
        </section>

        {report && (
          <div className="mt-8 space-y-6" aria-live="polite">
            <section aria-labelledby="summary-title">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div><p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Analysis summary</p><h2 id="summary-title" className="mt-1 text-2xl font-extrabold">Your results</h2></div>
                <p className="text-sm text-slate-500">{report.valid_records} valid of {report.total_records} records</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Total records" value={report.total_records} detail="Rows reviewed in the uploaded file" />
                <MetricCard label="Valid records" value={report.valid_records} detail="Passed all incident validation rules" accent="text-emerald-700" />
                <MetricCard label="Invalid records" value={report.invalid_records} detail="Need review before they can be included" accent={report.invalid_records ? "text-rose-700" : "text-navy"} />
              </div>
            </section>

            {report.invalid_records > 0 ? (
              <section role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-6">
                <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 font-extrabold text-amber-900" aria-hidden="true">!</span><div className="min-w-0"><h2 className="font-extrabold text-amber-950">{report.invalid_records} {report.invalid_records === 1 ? "record contains" : "records contain"} validation issues</h2><p className="mt-1 text-sm text-amber-900/80">A record can have more than one issue, so issue counts may add up to more than the number of invalid records.</p><ul className="mt-4 grid gap-2 sm:grid-cols-2">{invalidRules.map(([rule, item]) => <li key={rule} className="flex items-center justify-between gap-4 rounded-lg bg-white/70 px-3 py-2 text-sm"><span className="font-medium text-amber-950">{item.description}</span><span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-1 text-xs font-extrabold text-amber-950">{item.count}</span></li>)}</ul></div></div>
              </section>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">All records passed validation. No invalid records found.</div>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
              <BreakdownList title="Incidents by category" values={report.category_breakdown} emptyLabel="No valid records to break down." />
              <BreakdownList title="Incidents by status" values={report.status_breakdown} emptyLabel="No valid records to break down." />
            </div>

            <section className="rounded-2xl bg-navy p-6 text-white shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div><p className="text-xs font-extrabold uppercase tracking-widest text-mint">Customer experience</p><h2 className="mt-2 text-2xl font-extrabold">Satisfaction index</h2><p className="mt-2 text-sm text-white/60">Valid closed incidents with a satisfaction score</p></div>
                <div className="rounded-2xl bg-white/10 px-5 py-4 sm:text-right"><p className="text-3xl font-extrabold text-mint">{report.satisfaction.average_score !== null ? `${report.satisfaction.average_score.toFixed(2)} / 5` : "N/A"}</p><p className="mt-1 text-xs text-white/60">{report.satisfaction.scored_closed_incidents} scored of {report.satisfaction.closed_incidents} closed</p></div>
              </div>
              <div className="mt-7 grid grid-cols-5 gap-2 sm:gap-4">{[1, 2, 3, 4, 5].map((score) => <div key={score} className="rounded-xl bg-white/5 p-3 text-center"><p className="text-lg font-extrabold">{report.satisfaction.score_breakdown[String(score)] ?? 0}</p><p className="mt-1 text-xs text-white/50">Score {score}</p></div>)}</div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
