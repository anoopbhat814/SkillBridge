import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { badRequest, forbidden, notFound } from "../lib/errors";
import {
  alertInput,
  endorsementInput,
  feedbackInput,
  pushSubscriptionInput,
  referralInput,
  reviewInput,
} from "../validators/hiring";
import { requireCandidate, requireEmployerMember } from "../services/candidates";
import { employerReviews } from "../services/reviews";
import { createReferral } from "../services/referrals";
import { listNotifications, markAllRead, markRead, notify } from "../services/notifications";

export const communityRouter = Router();

// Reviews -------------------------------------------------------------
communityRouter.get("/employers/:id/reviews", async (req, res, next) => {
  try {
    res.json(await employerReviews(req.params.id));
  } catch (e) {
    next(e);
  }
});

communityRouter.put("/employers/:id/reviews", async (req: AuthedRequest, res, next) => {
  try {
    const data = reviewInput.parse(req.body);
    const me = await requireCandidate(req.user!.id);
    const worked = await prisma.application.count({
      where: { candidateId: me.id, job: { employerId: req.params.id }, status: { in: ["INTERVIEW", "OFFER", "HIRED"] } },
    });
    if (worked === 0) throw forbidden("Only candidates who interviewed with this employer can review it");
    const key = { employerId_authorId: { employerId: req.params.id, authorId: req.user!.id } };
    res.json(
      await prisma.review.upsert({
        where: key,
        update: data,
        create: { ...data, employerId: req.params.id, authorId: req.user!.id },
      }),
    );
  } catch (e) {
    next(e);
  }
});

// Referrals -----------------------------------------------------------
communityRouter.post("/referrals", async (req: AuthedRequest, res, next) => {
  try {
    const { jobId, refereeEmail } = referralInput.parse(req.body);
    res.status(201).json(await createReferral(req.user!.id, jobId, refereeEmail));
  } catch (e) {
    next(e);
  }
});

communityRouter.get("/referrals", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await prisma.referral.findMany({ where: { referrerId: req.user!.id }, orderBy: { createdAt: "desc" } }));
  } catch (e) {
    next(e);
  }
});

// Endorsements --------------------------------------------------------
communityRouter.post("/candidates/:id/endorsements", async (req: AuthedRequest, res, next) => {
  try {
    const { skillId, note } = endorsementInput.parse(req.body);
    const target = await prisma.candidateProfile.findUnique({ where: { id: req.params.id } });
    if (!target) throw notFound("Candidate");
    if (target.userId === req.user!.id) throw badRequest("You cannot endorse yourself");
    const held = await prisma.candidateSkill.findUnique({
      where: { candidateId_skillId: { candidateId: target.id, skillId } },
    });
    if (!held) throw badRequest("Candidate does not list this skill");
    const created = await prisma.skillEndorsement.create({
      data: { candidateId: target.id, skillId, endorserId: req.user!.id, note },
    });
    await notify(target.userId, "ENDORSEMENT", { title: "New endorsement", body: "Someone endorsed one of your skills." });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

communityRouter.get("/candidates/:id/endorsements", async (req, res, next) => {
  try {
    const grouped = await prisma.skillEndorsement.groupBy({
      by: ["skillId"],
      where: { candidateId: req.params.id },
      _count: { _all: true },
    });
    res.json(grouped.map((g) => ({ skillId: g.skillId, count: g._count._all })));
  } catch (e) {
    next(e);
  }
});

// Interview feedback --------------------------------------------------
communityRouter.put("/interviews/:id/feedback", async (req: AuthedRequest, res, next) => {
  try {
    const member = await requireEmployerMember(req.user!.id);
    const data = feedbackInput.parse(req.body);
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, application: { job: { employerId: member.employerId } } },
    });
    if (!interview) throw notFound("Interview");
    const key = { interviewId_reviewerId: { interviewId: interview.id, reviewerId: req.user!.id } };
    res.json(
      await prisma.interviewFeedback.upsert({
        where: key,
        update: data,
        create: { ...data, interviewId: interview.id, reviewerId: req.user!.id },
      }),
    );
  } catch (e) {
    next(e);
  }
});

// Job alerts & push subscriptions ------------------------------------
communityRouter.post("/alerts", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    res.status(201).json(await prisma.jobAlert.create({ data: { ...alertInput.parse(req.body), candidateId: me.id } }));
  } catch (e) {
    next(e);
  }
});

communityRouter.post("/push-subscriptions", async (req: AuthedRequest, res, next) => {
  try {
    const { endpoint, keys } = pushSubscriptionInput.parse(req.body);
    const data = { userId: req.user!.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent: req.header("user-agent") };
    res.status(201).json(await prisma.pushSubscription.upsert({ where: { endpoint }, update: data, create: data }));
  } catch (e) {
    next(e);
  }
});

// Notifications -------------------------------------------------------
communityRouter.get("/notifications", async (req: AuthedRequest, res, next) => {
  try {
    const q = z.object({ unread: z.coerce.boolean().optional(), take: z.coerce.number().int().positive().optional() }).parse(req.query);
    res.json(await listNotifications(req.user!.id, { unreadOnly: q.unread, take: q.take }));
  } catch (e) {
    next(e);
  }
});

communityRouter.post("/notifications/read-all", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ updated: await markAllRead(req.user!.id) });
  } catch (e) {
    next(e);
  }
});

communityRouter.post("/notifications/:id/read", async (req: AuthedRequest, res, next) => {
  try {
    await markRead(req.user!.id, req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
