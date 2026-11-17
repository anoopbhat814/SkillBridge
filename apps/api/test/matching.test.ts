import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    candidateSkill: {
      findMany: vi.fn().mockResolvedValue([{ skill: { name: "typescript" } }, { skill: { name: "react" } }]),
    },
    jobSkill: {
      findMany: vi
        .fn()
        .mockResolvedValue([{ skill: { name: "typescript" } }, { skill: { name: "go" } }]),
    },
  },
}));

import { fallbackMatch, scoreApplication } from "../src/services/matching";

afterEach(() => vi.restoreAllMocks());

describe("fallbackMatch", () => {
  it("computes the share of matched required skills", async () => {
    const result = await fallbackMatch("c1", "j1");
    expect(result.score).toBe(0.5);
    expect(result.matchedSkills).toEqual(["typescript"]);
    expect(result.missingSkills).toEqual(["go"]);
  });
});

describe("scoreApplication", () => {
  it("calls the matcher score endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ score: 0.87 }) });
    vi.stubGlobal("fetch", fetchMock);
    expect(await scoreApplication("c1", "j1")).toBe(0.87);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/v1\/match\/score$/);
  });

  it("falls back to the local heuristic when the matcher is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await scoreApplication("c1", "j1")).toBe(0.5);
  });
});
