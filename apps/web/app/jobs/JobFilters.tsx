import type { WorkMode } from "@skillbridge/types";

interface Props {
  q: string;
  workMode?: WorkMode;
  onQueryChange: (q: string) => void;
  onWorkModeChange: (mode?: WorkMode) => void;
}

export function JobFilters({ q, workMode, onQueryChange, onWorkModeChange }: Props) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()}>
      <input value={q} placeholder="Search jobs" onChange={(e) => onQueryChange(e.target.value)} />
      <select value={workMode ?? ""} onChange={(e) => onWorkModeChange((e.target.value || undefined) as WorkMode | undefined)}>
        <option value="">Any work mode</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
        <option value="ONSITE">On-site</option>
      </select>
    </form>
  );
}
