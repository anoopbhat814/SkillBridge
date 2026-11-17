import type { OfferStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { badRequest, notFound } from "../lib/errors";
import { notify } from "./notifications";

const TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  DRAFT: ["SENT", "RESCINDED"],
  SENT: ["ACCEPTED", "DECLINED", "EXPIRED", "RESCINDED"],
  ACCEPTED: [],
  DECLINED: [],
  EXPIRED: [],
  RESCINDED: [],
};

export function canTransition(from: OfferStatus, to: OfferStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface CreateOfferInput {
  applicationId: string;
  title: string;
  salary: number;
  currency: string;
  equityPercent?: number;
  startDate?: Date;
  expiresInDays: number;
}

/** Creates an offer in DRAFT; only applications past screening can receive one. */
export async function createOffer(employerId: string, input: CreateOfferInput) {
  const application = await prisma.application.findUnique({
    where: { id: input.applicationId },
    include: { job: true },
  });
  if (!application || application.job.employerId !== employerId) throw notFound("Application");
  if (!["INTERVIEW", "OFFER"].includes(application.status)) {
    throw badRequest("Offers require an application in INTERVIEW or OFFER stage");
  }
  const { expiresInDays, ...rest } = input;
  return prisma.offer.create({
    data: { ...rest, expiresAt: new Date(Date.now() + expiresInDays * 24 * 3600 * 1000) },
  });
}

/** Sends a draft offer, moves the application to OFFER and notifies the candidate. */
export async function sendOffer(offerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { application: { include: { candidate: true } } },
  });
  if (!offer) throw notFound("Offer");
  if (!canTransition(offer.status, "SENT")) throw badRequest(`Cannot send an offer that is ${offer.status}`);
  const [updated] = await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { status: "SENT", sentAt: new Date() } }),
    prisma.application.update({ where: { id: offer.applicationId }, data: { status: "OFFER" } }),
  ]);
  await notify(offer.application.candidate.userId, "OFFER_RECEIVED", {
    title: "You have a new offer",
    body: `An offer for ${offer.title} is waiting for your response.`,
    payload: { offerId },
  });
  return updated;
}

/** Candidate decision on a sent offer; expired offers are closed lazily here. */
export async function respondToOffer(offerId: string, candidateUserId: string, decision: "ACCEPT" | "DECLINE") {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { application: { include: { candidate: true } } },
  });
  if (!offer || offer.application.candidate.userId !== candidateUserId) throw notFound("Offer");
  if (offer.expiresAt && offer.expiresAt < new Date() && offer.status === "SENT") {
    await prisma.offer.update({ where: { id: offerId }, data: { status: "EXPIRED" } });
    throw badRequest("This offer has expired");
  }
  const next: OfferStatus = decision === "ACCEPT" ? "ACCEPTED" : "DECLINED";
  if (!canTransition(offer.status, next)) throw badRequest(`Cannot respond to an offer that is ${offer.status}`);
  const [updated] = await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { status: next, respondedAt: new Date() } }),
    prisma.application.update({
      where: { id: offer.applicationId },
      data: { status: decision === "ACCEPT" ? "HIRED" : "REJECTED" },
    }),
  ]);
  return updated;
}
