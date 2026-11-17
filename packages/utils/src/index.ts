import type { SkillLevel } from "@skillbridge/types";

const LEVEL_ORDER: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export function levelRank(level: SkillLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function meetsLevel(actual: SkillLevel, required: SkillLevel): boolean {
  return levelRank(actual) >= levelRank(required);
}

export function formatSalaryRange(min?: number, max?: number, currency = "USD"): string {
  if (min == null && max == null) return "Not disclosed";
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (min != null && max != null) return `${fmt.format(min)} - ${fmt.format(max)}`;
  return fmt.format((min ?? max) as number);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function groupBy<T, K extends string | number>(items: T[], key: (t: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    (acc[key(item)] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export { retry } from "./retry";
export { timeAgo, addMinutes, overlaps } from "./date";
export { toCursorPage } from "./pagination";
