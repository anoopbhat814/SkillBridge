import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma", () => ({ prisma: {} }));

import { summarizeRatings } from "../src/services/reviews";
import { generateReferralCode } from "../src/services/referrals";
import { totalExperienceYears } from "../src/services/candidates";

describe("summarizeRatings", () => {
  it("returns zeros for no reviews", () => {
    expect(summarizeRatings([])).toMatchObject({ count: 0, average: 0 });
  });

  it("averages, rounds and builds a distribution", () => {
    const s = summarizeRatings([5, 4, 4, 1]);
    expect(s.average).toBe(3.5);
    expect(s.distribution).toEqual({ 1: 1, 2: 0, 3: 0, 4: 2, 5: 1 });
  });

  it("ignores out-of-range values", () => {
    expect(summarizeRatings([0, 9, 3]).count).toBe(1);
  });
});

describe("generateReferralCode", () => {
  it("is prefixed, uses the safe alphabet and is unlikely to collide", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateReferralCode()));
    expect(codes.size).toBe(200);
    for (const c of codes) expect(c).toMatch(/^REF-[A-HJ-NP-Z2-9]{8}$/);
  });
});

describe("totalExperienceYears", () => {
  const d = (s: string) => new Date(s);
  const now = d("2024-01-01");

  it("sums disjoint spans", () => {
    const years = totalExperienceYears(
      [
        { startDate: d("2016-01-01"), endDate: d("2018-01-01") },
        { startDate: d("2020-01-01"), endDate: d("2023-01-01") },
      ],
      now,
    );
    expect(years).toBe(5);
  });

  it("does not double count overlapping roles", () => {
    const years = totalExperienceYears(
      [
        { startDate: d("2018-01-01"), endDate: d("2022-01-01") },
        { startDate: d("2019-01-01"), endDate: d("2021-01-01") },
      ],
      now,
    );
    expect(years).toBe(4);
  });

  it("treats open-ended roles as ongoing", () => {
    expect(totalExperienceYears([{ startDate: d("2021-01-01"), endDate: null }], now)).toBe(3);
  });
});
