import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { AuthedRequest } from "../middleware/auth";
import { gradeAttempt } from "../services/grading";

export const assessmentsRouter = Router();

assessmentsRouter.get("/:id", async (req, res, next) => {
  try {
    const assessment = await prisma.assessment.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { questions: { select: { id: true, prompt: true, options: true } } },
    });
    res.json(assessment);
  } catch (e) {
    next(e);
  }
});

assessmentsRouter.post("/:id/attempts", async (req: AuthedRequest, res, next) => {
  try {
    const { answers } = z.object({ answers: z.record(z.number().int()) }).parse(req.body);
    const candidate = await prisma.candidateProfile.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const result = await gradeAttempt(req.params.id, candidate.id, answers);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});
