export function PipelineChart({ pipeline }: { pipeline: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(pipeline));
  return (
    <div role="img" aria-label="Application pipeline">
      {Object.entries(pipeline).map(([status, count]) => (
        <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 96 }}>{status}</span>
          <div style={{ background: "#6366f1", height: 10, width: `${(count / max) * 100}%` }} />
          <span>{count}</span>
        </div>
      ))}
    </div>
  );
}
