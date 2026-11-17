import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/server";

describe("GET /healthz", () => {
  it("reports ok", async () => {
    const res = await request(createApp()).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("requires auth for protected routers", async () => {
    const res = await request(createApp()).get("/applications");
    expect(res.status).toBe(401);
  });
});
