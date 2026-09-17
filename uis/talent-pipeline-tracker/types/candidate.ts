export type CandidateStatus =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export type CandidateStage =
  | "Application"
  | "Initial Review"
  | "Phone Screen"
  | "Technical Interview"
  | "Final Interview"
  | "Offer"
  | "Hired";

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
