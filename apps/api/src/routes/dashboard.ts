import { Router } from "express";
import { prisma } from "../lib/prisma";
import type { AuthedRequest } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (req: AuthedRequest, res, next) => {
  try {
    const member = await prisma.employerMember.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const where = { job: { employerId: member.employerId } };
    const [openJobs, byStatus, avgScore, upcoming] = await Promise.all([
      prisma.job.count({ where: { employerId: member.employerId, status: "OPEN" } }),
      prisma.application.groupBy({ by: ["status"], where, _count: true }),
      prisma.application.aggregate({ where, _avg: { matchScore: true } }),
      prisma.interview.findMany({
        where: { startsAt: { gte: new Date() }, application: where, status: "CONFIRMED" },
        orderBy: { startsAt: "asc" },
        take: 5,
      }),
    ]);
    res.json({
      openJobs,
      pipeline: Object.fromEntries(byStatus.map((r) => [r.status, r._count])),
      averageMatchScore: avgScore._avg.matchScore ?? 0,
      upcomingInterviews: upcoming,
    });
  } catch (e) {
    next(e);
  }
});
