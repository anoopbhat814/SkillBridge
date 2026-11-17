import { describe, expect, it } from "vitest";
import { clamp, formatSalaryRange, groupBy, meetsLevel, slugify } from "./index";
import { overlaps, timeAgo } from "./date";
import { toCursorPage } from "./pagination";

describe("utils", () => {
  it("compares skill levels", () => {
    expect(meetsLevel("EXPERT", "ADVANCED")).toBe(true);
    expect(meetsLevel("BEGINNER", "INTERMEDIATE")).toBe(false);
  });

  it("formats salary ranges", () => {
    expect(formatSalaryRange(90000, 120000)).toBe("$90,000 - $120,000");
    expect(formatSalaryRange()).toBe("Not disclosed");
  });

  it("slugifies text", () => {
    expect(slugify("Senior Go Engineer (Remote)")).toBe("senior-go-engineer-remote");
  });

  it("clamps and groups", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(groupBy([1, 2, 3, 4], (n) => (n % 2 ? "odd" : "even"))).toEqual({ odd: [1, 3], even: [2, 4] });
  });

  it("detects overlapping intervals", () => {
    const t = (h: number) => new Date(Date.UTC(2024, 0, 1, h));
    expect(overlaps(t(9), t(10), t(9), t(11))).toBe(true);
    expect(overlaps(t(9), t(10), t(10), t(11))).toBe(false);
  });

  it("describes relative time", () => {
    const now = new Date("2024-03-10T12:00:00Z");
    expect(timeAgo("2024-03-10T11:30:00Z", now)).toBe("30 min ago");
    expect(timeAgo("2024-03-07T12:00:00Z", now)).toBe("3 days ago");
  });

  it("builds cursor pages", () => {
    const rows = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(toCursorPage(rows, 2)).toEqual({ items: [{ id: "a" }, { id: "b" }], nextCursor: "b" });
    expect(toCursorPage(rows, 5).nextCursor).toBeNull();
  });
});
