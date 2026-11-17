"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Job } from "@skillbridge/types";
import { api } from "../../../lib/api";
import { SkillBadge } from "../../../components/SkillBadge";

export default function JobDetail({ params }: { params: { id: string } }) {
  const { data: job } = useQuery({ queryKey: ["job", params.id], queryFn: () => api<Job>(`/jobs/${params.id}`) });
  const apply = useMutation({
    mutationFn: (coverLetter: string) =>
      api("/applications", { method: "POST", body: JSON.stringify({ jobId: params.id, coverLetter }) }),
  });

  if (!job) return <main>Loading…</main>;
  return (
    <main>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
      {job.skills.map((s) => (
        <SkillBadge key={s.skill.id} name={s.skill.name} level={s.minLevel} />
      ))}
      <button disabled={apply.isPending || apply.isSuccess} onClick={() => apply.mutate("I'd love to join the team.")}>
        {apply.isSuccess ? "Applied" : "Apply now"}
      </button>
      {apply.isError && <p role="alert">{(apply.error as Error).message}</p>}
    </main>
  );
}
