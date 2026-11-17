import { Router } from "express";
import type { AuthedRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { notFound } from "../lib/errors";
import { certificationInput, educationInput, experienceInput } from "../validators/profile";
import { requireCandidate, totalExperienceYears } from "../services/candidates";

export const profileRouter = Router();

profileRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    const profile = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: me.id },
      include: {
        educations: { orderBy: { startYear: "desc" } },
        experiences: { orderBy: { startDate: "desc" } },
        certifications: { orderBy: { issuedAt: "desc" } },
        skills: { include: { skill: true } },
      },
    });
    res.json({ ...profile, computedYears: totalExperienceYears(profile.experiences) });
  } catch (e) {
    next(e);
  }
});

profileRouter.post("/educations", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    const data = educationInput.parse(req.body);
    res.status(201).json(await prisma.education.create({ data: { ...data, candidateId: me.id } }));
  } catch (e) {
    next(e);
  }
});

profileRouter.post("/experiences", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    const data = experienceInput.parse(req.body);
    const created = await prisma.workExperience.create({ data: { ...data, candidateId: me.id } });
    const all = await prisma.workExperience.findMany({ where: { candidateId: me.id } });
    await prisma.candidateProfile.update({
      where: { id: me.id },
      data: { yearsExperience: totalExperienceYears(all) },
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

profileRouter.post("/certifications", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    const data = certificationInput.parse(req.body);
    res.status(201).json(await prisma.certification.create({ data: { ...data, candidateId: me.id } }));
  } catch (e) {
    next(e);
  }
});

const owned = { educations: "education", experiences: "workExperience", certifications: "certification" } as const;

profileRouter.delete("/:section(educations|experiences|certifications)/:id", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    const model = prisma[owned[req.params.section as keyof typeof owned]] as unknown as {
      deleteMany(args: { where: { id: string; candidateId: string } }): Promise<{ count: number }>;
    };
    const { count } = await model.deleteMany({ where: { id: req.params.id, candidateId: me.id } });
    if (count === 0) throw notFound("Entry");
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
