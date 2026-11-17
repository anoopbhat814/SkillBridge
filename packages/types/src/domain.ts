export type Role = "CANDIDATE" | "EMPLOYER" | "ADMIN";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";
export type JobStatus = "DRAFT" | "OPEN" | "PAUSED" | "CLOSED";
export type ApplicationStatus =
  | "SUBMITTED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface SkillRef {
  id: string;
  name: string;
  category: string;
}

export interface CandidateSkill {
  skill: SkillRef;
  level: SkillLevel;
  verified: boolean;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  headline?: string;
  location?: string;
  yearsExperience: number;
  skills: CandidateSkill[];
}

export interface JobSkillRequirement {
  skill: SkillRef;
  minLevel: SkillLevel;
  required: boolean;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location?: string;
  workMode: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  postedAt?: string;
  skills: JobSkillRequirement[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  matchScore?: number;
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  startsAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  status: "PROPOSED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}
