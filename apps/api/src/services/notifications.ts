import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { notFound } from "../lib/errors";

export interface NotifyInput {
  title: string;
  body: string;
  payload?: Prisma.InputJsonValue;
}

/** Stores an in-app notification; email/push delivery is handled downstream by the worker. */
export async function notify(userId: string, type: NotificationType, input: NotifyInput) {
  return prisma.notification.create({
    data: { userId, type, channel: "IN_APP", title: input.title, body: input.body, payload: input.payload },
  });
}

export async function listNotifications(userId: string, opts: { unreadOnly?: boolean; take?: number } = {}) {
  const take = Math.min(opts.take ?? 30, 100);
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, ...(opts.unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { items, unread };
}

export async function markRead(userId: string, id: string) {
  const { count } = await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  if (count === 0) {
    const exists = await prisma.notification.findFirst({ where: { id, userId } });
    if (!exists) throw notFound("Notification");
  }
}

export async function markAllRead(userId: string): Promise<number> {
  const { count } = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return count;
}
