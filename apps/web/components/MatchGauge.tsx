export function MatchGauge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#dc2626";

  return (
    <svg width="72" height="72" role="img" aria-label={`${pct}% match`}>
      <circle cx="36" cy="36" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
      <circle
        cx="36"
        cy="36"
        r={radius}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - score)}
        transform="rotate(-90 36 36)"
        strokeLinecap="round"
      />
      <text x="36" y="41" textAnchor="middle" fontSize="16" fontWeight="600">
        {pct}%
      </text>
    </svg>
  );
}
