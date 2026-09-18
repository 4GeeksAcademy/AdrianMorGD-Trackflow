export type CandidateStatus =
  | "received"
  | "in_progress"
  | "selected"
  | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export const statusOptions: Array<{ value: CandidateStatus; label: string }> = [
  { value: "received", label: "Received" },
  { value: "in_progress", label: "In progress" },
  { value: "selected", label: "Selected" },
  { value: "discarded", label: "Discarded" },
];

export const stageOptions: Array<{ value: CandidateStage; label: string }> = [
  { value: "pending", label: "Pending review" },
  { value: "review", label: "Under review" },
  { value: "personal_interview", label: "Personal interview" },
  { value: "technical_interview", label: "Technical interview" },
  { value: "offer_presented", label: "Offer presented" },
];

export const statusLabels: Record<CandidateStatus, string> = Object.fromEntries(
  statusOptions.map(({ value, label }) => [value, label]),
) as Record<CandidateStatus, string>;

export const stageLabels: Record<CandidateStage, string> = Object.fromEntries(
  stageOptions.map(({ value, label }) => [value, label]),
) as Record<CandidateStage, string>;

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  linkedin?: string;
  cvUrl?: string;
  yearsExperience?: number;
  status: CandidateStatus;
  stage: CandidateStage;
  applicationDate: string;
  notes?: CandidateNote[];
};

export type CandidateNote = {
  id: string;
  candidateId?: string;
  text: string;
  createdAt: string;
};

export type CandidateFormValues = {
  name: string;
  email: string;
  phone: string;
  position: string;
  linkedin: string;
  cvUrl: string;
  yearsExperience: string;
  status: CandidateStatus;
  stage: CandidateStage;
};
