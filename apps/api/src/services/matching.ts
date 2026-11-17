import type { MatchResult } from "@skillbridge/types";
import { prisma } from "../lib/prisma";

const MATCHER_URL = process.env.MATCHER_URL ?? "http://localhost:8000";

/** Ask the Python matcher service for a score; fall back to a local heuristic. */
export async function scoreApplication(candidateId: string, jobId: string): Promise<number> {
  try {
    const res = await fetch(`${MATCHER_URL}/v1/match/score`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ candidate_id: candidateId, job_id: jobId }),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = (await res.json()) as { score: number };
      return data.score;
    }
  } catch (err) {
    console.warn("matcher unavailable, using fallback", err);
  }
  return (await fallbackMatch(candidateId, jobId)).score;
}

export async function fallbackMatch(candidateId: string, jobId: string): Promise<MatchResult> {
  const [skills, reqs] = await Promise.all([
    prisma.candidateSkill.findMany({ where: { candidateId }, include: { skill: true } }),
    prisma.jobSkill.findMany({ where: { jobId }, include: { skill: true } }),
  ]);
  const have = new Set(skills.map((s) => s.skill.name));
  const matched = reqs.filter((r) => have.has(r.skill.name)).map((r) => r.skill.name);
  const missing = reqs.filter((r) => !have.has(r.skill.name)).map((r) => r.skill.name);
  const score = reqs.length === 0 ? 0 : matched.length / reqs.length;
  return { candidateId, jobId, score, matchedSkills: matched, missingSkills: missing };
}
