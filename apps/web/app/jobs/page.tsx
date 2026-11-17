"use client";
import { useState } from "react";
import type { WorkMode } from "@skillbridge/types";
import { useJobs } from "../../hooks/useJobs";
import { JobCard } from "../../components/JobCard";

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode | undefined>();
  const { data, fetchNextPage, hasNextPage, isLoading } = useJobs({ q, workMode });

  return (
    <main>
      <h1>Open roles</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or description" />
      <select value={workMode ?? ""} onChange={(e) => setWorkMode((e.target.value || undefined) as WorkMode | undefined)}>
        <option value="">Any mode</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
        <option value="ONSITE">On-site</option>
      </select>
      {isLoading && <p>Loading…</p>}
      {data?.pages.flatMap((p) => p.items).map((job) => <JobCard key={job.id} job={job} />)}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load more</button>}
    </main>
  );
}
