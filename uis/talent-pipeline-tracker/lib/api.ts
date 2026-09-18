import { mockCandidates } from "./mock-data";
import type { Candidate, CandidateNote } from "../types/candidate";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

function nextMockId(prefix: string): string {
  const taken = new Set<string>();

  mockCandidates.forEach((candidate) => {
    taken.add(candidate.id);
    (candidate.notes ?? []).forEach((note) => taken.add(note.id));
  });

  let value = Date.now();
  while (taken.has(`${prefix}-${value}`)) {
    value += 1;
  }

  return `${prefix}-${value}`;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;

  if (!apiBaseUrl) {
    return Promise.resolve((mockCandidates as T) ?? ([] as T));
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getCandidates(): Promise<Candidate[]> {
  if (!apiBaseUrl) {
    return [...mockCandidates];
  }

  const data = await fetchJson<Candidate[]>("/records");
  return data.map((candidate) => ({
    ...candidate,
    notes: candidate.notes ?? [],
  }));
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  if (!apiBaseUrl) {
    return mockCandidates.find((candidate) => candidate.id === id) ?? null;
  }

  return fetchJson<Candidate>(`/records/${id}`);
}

export async function getCandidateNotes(id: string): Promise<CandidateNote[]> {
  if (!apiBaseUrl) {
    return mockCandidates.find((candidate) => candidate.id === id)?.notes ?? [];
  }

  return fetchJson<CandidateNote[]>(`/records/${id}/notes`);
}

export async function patchCandidate(
  id: string,
  payload: Partial<Pick<Candidate, "status" | "stage">>,
): Promise<Candidate> {
  if (!apiBaseUrl) {
    const candidate = mockCandidates.find((item) => item.id === id);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    return {
      ...candidate,
      status: payload.status ?? candidate.status,
      stage: payload.stage ?? candidate.stage,
    };
  }

  return fetchJson<Candidate>(`/records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createCandidate(payload: Record<string, unknown>): Promise<Candidate> {
  if (!apiBaseUrl) {
    const newCandidate: Candidate = {
      id: nextMockId("c"),
      name: String(payload.name ?? "New candidate"),
      email: String(payload.email ?? "no-email@example.com"),
      phone: String(payload.phone ?? ""),
      position: String(payload.position ?? "Unassigned role"),
      linkedin: String(payload.linkedin ?? ""),
      cvUrl: String(payload.cvUrl ?? ""),
      yearsExperience: Number(payload.yearsExperience ?? 0),
      status: (payload.status as Candidate["status"]) ?? "received",
      stage: (payload.stage as Candidate["stage"]) ?? "pending",
      applicationDate: new Date().toISOString().slice(0, 10),
      notes: [],
    };

    mockCandidates.unshift(newCandidate);
    return newCandidate;
  }

  return fetchJson<Candidate>("/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCandidate(
  id: string,
  payload: Record<string, unknown>,
): Promise<Candidate> {
  if (!apiBaseUrl) {
    const candidate = mockCandidates.find((item) => item.id === id);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const updatedCandidate = {
      ...candidate,
      ...payload,
      yearsExperience: Number(payload.yearsExperience ?? candidate.yearsExperience ?? 0),
    };

    const index = mockCandidates.findIndex((item) => item.id === id);
    mockCandidates[index] = updatedCandidate;
    return updatedCandidate;
  }

  return fetchJson<Candidate>(`/records/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function addCandidateNote(
  candidateId: string,
  text: string,
): Promise<CandidateNote> {
  if (!apiBaseUrl) {
    const note: CandidateNote = {
      id: nextMockId("n"),
      candidateId,
      text,
      createdAt: new Date().toISOString(),
    };

    const candidate = mockCandidates.find((item) => item.id === candidateId);
    if (candidate) {
      candidate.notes = [...(candidate.notes ?? []), note];
    }

    return note;
  }

  const endpoint = `/records/${candidateId}/notes`;
  return fetchJson<CandidateNote>(endpoint, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function deleteCandidateNote(
  candidateId: string,
  noteId: string,
): Promise<void> {
  if (!apiBaseUrl) {
    const candidate = mockCandidates.find((item) => item.id === candidateId);
    if (candidate) {
      candidate.notes = (candidate.notes ?? []).filter((note) => note.id !== noteId);
    }
    return;
  }

  await fetchJson<void>(`/records/${candidateId}/notes/${noteId}`, {
    method: "DELETE",
  });
}
