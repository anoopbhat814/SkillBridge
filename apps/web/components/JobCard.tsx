import Link from "next/link";
import type { Job } from "@skillbridge/types";
import { formatSalaryRange } from "@skillbridge/utils";
import { SkillBadge } from "./SkillBadge";

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <h3>
        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <p className="meta">
        {job.workMode.toLowerCase()} · {job.location ?? "Anywhere"} · {formatSalaryRange(job.salaryMin, job.salaryMax)}
      </p>
      <div className="skills">
        {job.skills.map((s) => (
          <SkillBadge key={s.skill.id} name={s.skill.name} level={s.minLevel} />
        ))}
      </div>
    </article>
  );
}
