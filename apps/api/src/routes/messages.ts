import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { AuthedRequest } from "../middleware/auth";
import { forbidden } from "../lib/errors";
import { publishMessage } from "../services/messageBus";

export const messagesRouter = Router();

messagesRouter.get("/conversations", async (req: AuthedRequest, res, next) => {
  try {
    const convos = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user!.id } } },
      include: { messages: { orderBy: { sentAt: "desc" }, take: 1 } },
    });
    res.json(convos);
  } catch (e) {
    next(e);
  }
});

messagesRouter.post("/conversations/:id/messages", async (req: AuthedRequest, res, next) => {
  try {
    const { body } = z.object({ body: z.string().min(1).max(5000) }).parse(req.body);
    const member = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user!.id } },
    });
    if (!member) throw forbidden("Not a participant");
    const msg = await prisma.message.create({
      data: { conversationId: req.params.id, senderId: req.user!.id, body },
    });
    await publishMessage(msg);
    res.status(201).json(msg);
  } catch (e) {
    next(e);
  }
});
