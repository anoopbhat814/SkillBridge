import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { findOpenSlots } from "../services/scheduling";

export const interviewsRouter = Router();

interviewsRouter.get("/slots", async (req, res, next) => {
  try {
    const q = z.object({ employerId: z.string(), date: z.string() }).parse(req.query);
    res.json(await findOpenSlots(q.employerId, new Date(q.date)));
  } catch (e) {
    next(e);
  }
});

interviewsRouter.post("/", async (req, res, next) => {
  try {
    const body = z
      .object({
        applicationId: z.string(),
        startsAt: z.coerce.date(),
        durationMinutes: z.number().int().min(15).max(180).default(45),
      })
      .parse(req.body);
    const interview = await prisma.interview.create({
      data: { ...body, meetingUrl: `https://meet.skillbridge.example/${body.applicationId}` },
    });
    await prisma.application.update({ where: { id: body.applicationId }, data: { status: "INTERVIEW" } });
    res.status(201).json(interview);
  } catch (e) {
    next(e);
  }
});

interviewsRouter.patch("/:id/confirm", async (req, res, next) => {
  try {
    res.json(await prisma.interview.update({ where: { id: req.params.id }, data: { status: "CONFIRMED" } }));
  } catch (e) {
    next(e);
  }
});
