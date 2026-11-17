import type { SkillLevel } from "@skillbridge/types";

const COLORS: Record<SkillLevel, string> = {
  BEGINNER: "#94a3b8",
  INTERMEDIATE: "#38bdf8",
  ADVANCED: "#6366f1",
  EXPERT: "#f59e0b",
};

export function SkillBadge({ name, level, verified }: { name: string; level: SkillLevel; verified?: boolean }) {
  return (
    <span
      style={{ border: `1px solid ${COLORS[level]}`, color: COLORS[level], borderRadius: 999, padding: "2px 10px" }}
      title={`${name} - ${level.toLowerCase()}`}
    >
      {name}
      {verified && <span aria-label="verified"> ✓</span>}
    </span>
  );
}
