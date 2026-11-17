import { prisma } from "../lib/prisma";
import { forbidden } from "../lib/errors";

/** Resolves the candidate profile owned by a user or throws 403. */
export async function requireCandidate(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile) throw forbidden("A candidate profile is required");
  return profile;
}

/** Resolves the employer a user belongs to or throws 403. */
export async function requireEmployerMember(userId: string) {
  const member = await prisma.employerMember.findUnique({ where: { userId } });
  if (!member) throw forbidden("Employer membership required");
  return member;
}

/** Total whole years covered by work experience entries, merging overlaps. */
export function totalExperienceYears(
  entries: Array<{ startDate: Date; endDate: Date | null }>,
  now: Date = new Date(),
): number {
  const spans = entries
    .map((e) => [e.startDate.getTime(), (e.endDate ?? now).getTime()] as const)
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curStart = 0;
  let curEnd = 0;
  for (const [s, e] of spans) {
    if (curEnd === 0 || s > curEnd) {
      total += curEnd - curStart;
      curStart = s;
      curEnd = e;
    } else if (e > curEnd) {
      curEnd = e;
    }
  }
  total += curEnd - curStart;
  return Math.floor(total / (365.25 * 24 * 3600 * 1000));
}
