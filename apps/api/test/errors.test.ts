import { describe, expect, it } from "vitest";
import { HttpError, badRequest, forbidden, notFound } from "../src/lib/errors";

describe("error helpers", () => {
  it("builds a 404 with the resource name", () => {
    const err = notFound("Job");
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(404);
    expect(err.message).toBe("Job not found");
  });

  it("builds a 403 with a default message", () => {
    expect(forbidden().message).toBe("Not allowed");
  });

  it("keeps validation details on 400s", () => {
    const err = badRequest("Invalid input", { field: "email" });
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.details).toEqual({ field: "email" });
  });
});
