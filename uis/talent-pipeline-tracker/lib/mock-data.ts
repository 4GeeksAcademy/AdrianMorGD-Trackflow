import type { Candidate, CandidateNote } from "../types/candidate";

const notes: Record<string, CandidateNote[]> = {
  "c-101": [
    {
      id: "n-1",
      candidateId: "c-101",
      text: "Strong logistics background and quick response during the initial outreach.",
      createdAt: "2026-09-02T10:00:00.000Z",
    },
    {
      id: "n-2",
      candidateId: "c-101",
      text: "Requested follow-up after portfolio review and wants a quick turnaround.",
      createdAt: "2026-09-08T15:30:00.000Z",
    },
  ],
  "c-102": [
    {
      id: "n-3",
      candidateId: "c-102",
      text: "Candidate demonstrated analytical thinking and is a good fit for operations analytics.",
      createdAt: "2026-09-04T09:00:00.000Z",
    },
  ],
  "c-103": [
    {
      id: "n-4",
      candidateId: "c-103",
      text: "Hired for warehouse optimization project; work samples are solid.",
      createdAt: "2026-09-07T11:15:00.000Z",
    },
  ],
};

export const mockCandidates: Candidate[] = [
  {
    id: "c-101",
    name: "Ana García",
    email: "ana.garcia@trackflow.io",
    phone: "+34 600 111 222",
    position: "Operations Analyst",
    linkedin: "https://linkedin.com/in/anagarcia",
    cvUrl: "https://example.com/cv/ana-garcia.pdf",
    yearsExperience: 5,
    status: "in_progress",
    stage: "technical_interview",
    applicationDate: "2026-09-02",
    notes: notes["c-101"],
  },
  {
    id: "c-102",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@trackflow.io",
    phone: "+1 415 555 0101",
    position: "Customer Success Lead",
    linkedin: "https://linkedin.com/in/carlosmendoza",
    cvUrl: "https://example.com/cv/carlos-mendoza.pdf",
    yearsExperience: 7,
    status: "received",
    stage: "review",
    applicationDate: "2026-09-05",
    notes: notes["c-102"],
  },
  {
    id: "c-103",
    name: "Priya Shah",
    email: "priya.shah@trackflow.io",
    phone: "+44 7700 900123",
    position: "Warehouse Systems Specialist",
    linkedin: "https://linkedin.com/in/priyashah",
    cvUrl: "https://example.com/cv/priya-shah.pdf",
    yearsExperience: 6,
    status: "selected",
    stage: "offer_presented",
    applicationDate: "2026-08-27",
    notes: notes["c-103"],
  },
];

export const emptyCandidateForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  linkedin: "",
  cvUrl: "",
  yearsExperience: "",
  status: "received" as const,
  stage: "pending" as const,
};
