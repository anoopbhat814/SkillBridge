import { Router } from "express";
import type { AuthedRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { offerInput, offerResponse } from "../validators/hiring";
import { requireCandidate, requireEmployerMember } from "../services/candidates";
import { createOffer, respondToOffer, sendOffer } from "../services/offers";
import { notFound } from "../lib/errors";

export const offersRouter = Router();

offersRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const member = await requireEmployerMember(req.user!.id);
    res.status(201).json(await createOffer(member.employerId, offerInput.parse(req.body)));
  } catch (e) {
    next(e);
  }
});

offersRouter.post("/:id/send", async (req: AuthedRequest, res, next) => {
  try {
    const member = await requireEmployerMember(req.user!.id);
    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id, application: { job: { employerId: member.employerId } } },
    });
    if (!offer) throw notFound("Offer");
    res.json(await sendOffer(offer.id));
  } catch (e) {
    next(e);
  }
});

offersRouter.get("/mine", async (req: AuthedRequest, res, next) => {
  try {
    const me = await requireCandidate(req.user!.id);
    res.json(
      await prisma.offer.findMany({
        where: { application: { candidateId: me.id }, status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (e) {
    next(e);
  }
});

offersRouter.post("/:id/respond", async (req: AuthedRequest, res, next) => {
  try {
    const { decision } = offerResponse.parse(req.body);
    res.json(await respondToOffer(req.params.id, req.user!.id, decision));
  } catch (e) {
    next(e);
  }
});
