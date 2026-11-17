import { describe, expect, it } from "vitest";
import { certificationInput, educationInput, experienceInput } from "../src/validators/profile";
import { offerInput, referralInput, reviewInput } from "../src/validators/hiring";

describe("profile validators", () => {
  it("rejects an education that ends before it starts", () => {
    const r = educationInput.safeParse({ institution: "MIT", degree: "BSc", startYear: 2018, endYear: 2015 });
    expect(r.success).toBe(false);
  });

  it("defaults work mode and coerces dates", () => {
    const r = experienceInput.parse({ company: "Acme", title: "Dev", startDate: "2020-01-01" });
    expect(r.workMode).toBe("ONSITE");
    expect(r.startDate).toBeInstanceOf(Date);
  });

  it("requires certification expiry after issue", () => {
    const bad = certificationInput.safeParse({ name: "CKA", issuer: "CNCF", issuedAt: "2024-01-01", expiresAt: "2023-01-01" });
    expect(bad.success).toBe(false);
  });
});

describe("hiring validators", () => {
  it("applies offer defaults and uppercases currency", () => {
    const o = offerInput.parse({ applicationId: "a", title: "Staff Engineer", salary: 150000, currency: "eur" });
    expect(o.currency).toBe("EUR");
    expect(o.expiresInDays).toBe(7);
  });

  it("rejects short review bodies and out-of-range ratings", () => {
    expect(reviewInput.safeParse({ rating: 6, title: "Great", body: "x".repeat(30) }).success).toBe(false);
    expect(reviewInput.safeParse({ rating: 5, title: "Great", body: "too short" }).success).toBe(false);
  });

  it("normalizes referee email", () => {
    expect(referralInput.parse({ jobId: "j1", refereeEmail: "Friend@Example.COM" }).refereeEmail).toBe("friend@example.com");
  });
});
