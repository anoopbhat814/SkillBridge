import { randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import { badRequest, notFound } from "../lib/errors";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

export function generateReferralCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `REF-${out}`;
}

export async function createReferral(referrerId: string, jobId: string, refereeEmail: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "OPEN") throw notFound("Open job");
  const duplicate = await prisma.referral.findFirst({
    where: { jobId, referrerId, refereeEmail, status: "PENDING" },
  });
  if (duplicate) throw badRequest("You already referred this person for the job");
  return prisma.referral.create({
    data: { jobId, referrerId, refereeEmail, code: generateReferralCode() },
  });
}

/** Marks a pending referral as applied when the referee submits an application. */
export async function redeemReferral(code: string, refereeEmail: string) {
  const referral = await prisma.referral.findUnique({ where: { code } });
  if (!referral || referral.status !== "PENDING") throw notFound("Referral");
  if (referral.refereeEmail !== refereeEmail.toLowerCase()) throw badRequest("Referral was issued to a different email");
  return prisma.referral.update({ where: { id: referral.id }, data: { status: "APPLIED" } });
}
