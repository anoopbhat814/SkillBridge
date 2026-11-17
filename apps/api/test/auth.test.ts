import { beforeAll, describe, expect, it, vi } from "vitest";
import { requireAuth, signToken } from "../src/middleware/auth";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-value-123";
});

function run(role: Parameters<typeof requireAuth>[0], header?: string) {
  const next = vi.fn();
  const req: any = { header: () => header };
  requireAuth(role)(req, {} as any, next);
  return { next, req };
}

describe("requireAuth", () => {
  it("rejects requests without a token", () => {
    const { next } = run(undefined);
    expect(next.mock.calls[0][0]).toMatchObject({ status: 401 });
  });

  it("accepts a valid token and attaches the user", () => {
    const token = signToken({ id: "u1", role: "CANDIDATE" });
    const { next, req } = run(undefined, `Bearer ${token}`);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: "u1", role: "CANDIDATE" });
  });

  it("forbids the wrong role but allows admins", () => {
    const candidate = signToken({ id: "u1", role: "CANDIDATE" });
    const admin = signToken({ id: "u2", role: "ADMIN" });
    expect(run("EMPLOYER", `Bearer ${candidate}`).next.mock.calls[0][0]).toMatchObject({ status: 403 });
    expect(run("EMPLOYER", `Bearer ${admin}`).next).toHaveBeenCalledWith();
  });
});
