import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { notFound } from "../lib/errors";

export const jobsRouter = Router();

const searchSchema = z.object({
  q: z.string().optional(),
  workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]).optional(),
  minSalary: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

jobsRouter.get("/", async (req, res, next) => {
  try {
    const p = searchSchema.parse(req.query);
    const items = await prisma.job.findMany({
      where: {
        status: "OPEN",
        workMode: p.workMode,
        salaryMax: p.minSalary ? { gte: p.minSalary } : undefined,
        OR: p.q
          ? [
              { title: { contains: p.q, mode: "insensitive" } },
              { description: { contains: p.q, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { skills: { include: { skill: true } }, employer: true },
      orderBy: { postedAt: "desc" },
      take: p.limit + 1,
      ...(p.cursor ? { cursor: { id: p.cursor }, skip: 1 } : {}),
    });
    const hasMore = items.length > p.limit;
    const page = hasMore ? items.slice(0, -1) : items;
    res.json({ items: page, nextCursor: hasMore ? page[page.length - 1].id : null });
  } catch (e) {
    next(e);
  }
});

jobsRouter.get("/:id", async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { skills: { include: { skill: true } }, employer: true },
    });
    if (!job) throw notFound("Job");
    res.json(job);
  } catch (e) {
    next(e);
  }
});

jobsRouter.post("/", requireAuth("EMPLOYER"), async (req: AuthedRequest, res, next) => {
  try {
    const body = z
      .object({
        title: z.string().min(3),
        description: z.string().min(20),
        workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
        skillIds: z.array(z.string()).min(1),
      })
      .parse(req.body);
    const member = await prisma.employerMember.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const job = await prisma.job.create({
      data: {
        employerId: member.employerId,
        title: body.title,
        description: body.description,
        workMode: body.workMode,
        status: "OPEN",
        postedAt: new Date(),
        skills: { create: body.skillIds.map((skillId) => ({ skillId })) },
      },
    });
    res.status(201).json(job);
  } catch (e) {
    next(e);
  }
});
