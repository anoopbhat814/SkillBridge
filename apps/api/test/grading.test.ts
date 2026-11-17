import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    assessment: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        skillId: "s1",
        passScore: 70,
        questions: [
          { id: "q1", correctIndex: 1, weight: 1 },
          { id: "q2", correctIndex: 0, weight: 1 },
        ],
      }),
    },
    assessmentAttempt: { create: vi.fn(async ({ data }) => data) },
    candidateSkill: { upsert: vi.fn() },
  },
}));

import { gradeAttempt } from "../src/services/grading";
import { prisma } from "../src/lib/prisma";

describe("gradeAttempt", () => {
  it("passes and verifies the skill when score meets threshold", async () => {
    const result = await gradeAttempt("a1", "c1", { q1: 1, q2: 0 });
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(prisma.candidateSkill.upsert).toHaveBeenCalled();
  });

  it("fails when below pass score", async () => {
    const result = await gradeAttempt("a1", "c1", { q1: 0, q2: 1 });
    expect(result.passed).toBe(false);
  });
});
