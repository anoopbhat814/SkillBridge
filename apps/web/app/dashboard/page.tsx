"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { MatchGauge } from "../../components/MatchGauge";

interface Summary {
  openJobs: number;
  pipeline: Record<string, number>;
  averageMatchScore: number;
  upcomingInterviews: Array<{ id: string; startsAt: string }>;
}

export default function EmployerDashboard() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Summary>("/dashboard/summary") });
  if (!data) return <main>Loading dashboard…</main>;

  return (
    <main>
      <h1>Hiring overview</h1>
      <section className="stats">
        <div><strong>{data.openJobs}</strong> open roles</div>
        <MatchGauge score={data.averageMatchScore} />
      </section>
      <h2>Pipeline</h2>
      <ul>
        {Object.entries(data.pipeline).map(([status, n]) => (
          <li key={status}>{status}: {n}</li>
        ))}
      </ul>
      <h2>Upcoming interviews</h2>
      <ul>
        {data.upcomingInterviews.map((i) => (
          <li key={i.id}>{new Date(i.startsAt).toLocaleString()}</li>
        ))}
      </ul>
    </main>
  );
}
