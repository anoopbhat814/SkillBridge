import type { Application, CandidateProfile, Job, Role } from "./domain";

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; role: Role };
}

export interface MatchResult {
  candidateId: string;
  jobId: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface ApplyRequest {
  jobId: string;
  coverLetter?: string;
}

export interface ApplicationWithCandidate extends Application {
  candidate: CandidateProfile;
}

export interface JobSearchParams {
  q?: string;
  workMode?: Job["workMode"];
  minSalary?: number;
  cursor?: string;
  limit?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
