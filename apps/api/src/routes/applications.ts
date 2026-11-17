import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { AuthedRequest } from "../middleware/auth";
import { scoreApplication } from "../services/matching";
import { forbidden, notFound } from "../lib/errors";

export const applicationsRouter = Router();

applicationsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const { jobId, coverLetter } = z
      .object({ jobId: z.string(), coverLetter: z.string().max(4000).optional() })
      .parse(req.body);
    const candidate = await prisma.candidateProfile.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const matchScore = await scoreApplication(candidate.id, jobId);
    const app = await prisma.application.create({
      data: { jobId, candidateId: candidate.id, coverLetter, matchScore },
    });
    res.status(201).json(app);
  } catch (e) {
    next(e);
  }
});

applicationsRouter.patch("/:id/status", async (req: AuthedRequest, res, next) => {
  try {
    const { status } = z
      .object({ status: z.enum(["SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]) })
      .parse(req.body);
    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: { include: { employer: { include: { members: true } } } } },
    });
    if (!app) throw notFound("Application");
    const isMember = app.job.employer.members.some((m) => m.userId === req.user!.id);
    if (!isMember) throw forbidden("Only the hiring team can change status");
    res.json(await prisma.application.update({ where: { id: app.id }, data: { status } }));
  } catch (e) {
    next(e);
  }
});

applicationsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const result = await prisma.application.updateMany({
      where: { id: req.params.id, candidate: { userId: req.user!.id } },
      data: { status: "WITHDRAWN" },
    });
    if (result.count === 0) throw notFound("Application");
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
