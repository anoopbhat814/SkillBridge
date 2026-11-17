import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    application: { findUnique: vi.fn(), update: vi.fn() },
    offer: { create: vi.fn(async ({ data }) => data), findUnique: vi.fn(), update: vi.fn(async ({ data }) => data) },
    notification: { create: vi.fn() },
    $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
  },
}));

import { prisma } from "../src/lib/prisma";
import { canTransition, createOffer, respondToOffer } from "../src/services/offers";

const base = { applicationId: "a1", title: "Engineer", salary: 100000, currency: "USD", expiresInDays: 7 };

describe("offer state machine", () => {
  it.each([
    ["DRAFT", "SENT", true],
    ["SENT", "ACCEPTED", true],
    ["SENT", "DRAFT", false],
    ["ACCEPTED", "DECLINED", false],
    ["EXPIRED", "SENT", false],
  ] as const)("%s -> %s is %s", (from, to, ok) => {
    expect(canTransition(from, to)).toBe(ok);
  });
});

describe("createOffer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects applications that belong to another employer", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ status: "INTERVIEW", job: { employerId: "other" } } as never);
    await expect(createOffer("e1", base)).rejects.toMatchObject({ status: 404 });
  });

  it("rejects applications that have not reached interview", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ status: "SUBMITTED", job: { employerId: "e1" } } as never);
    await expect(createOffer("e1", base)).rejects.toMatchObject({ status: 400 });
  });

  it("sets an expiry derived from expiresInDays", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue({ status: "INTERVIEW", job: { employerId: "e1" } } as never);
    const offer = (await createOffer("e1", base)) as unknown as { expiresAt: Date };
    const days = (offer.expiresAt.getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });
});

describe("respondToOffer", () => {
  const sent = (over: object = {}) =>
    ({ id: "o1", applicationId: "a1", status: "SENT", expiresAt: null, application: { candidate: { userId: "u1" } }, ...over }) as never;

  it("hires the candidate on acceptance", async () => {
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(sent());
    await respondToOffer("o1", "u1", "ACCEPT");
    expect(prisma.application.update).toHaveBeenCalledWith({ where: { id: "a1" }, data: { status: "HIRED" } });
  });

  it("refuses expired offers", async () => {
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(sent({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(respondToOffer("o1", "u1", "ACCEPT")).rejects.toMatchObject({ status: 400 });
  });

  it("hides offers addressed to someone else", async () => {
    vi.mocked(prisma.offer.findUnique).mockResolvedValue(sent());
    await expect(respondToOffer("o1", "intruder", "DECLINE")).rejects.toMatchObject({ status: 404 });
  });
});
