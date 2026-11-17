const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Closes job postings that have been open longer than `maxAgeDays`. */
export async function handleExpireJobs({ maxAgeDays = 60 } = {}) {
  const res = await fetch(`${API_URL}/internal/jobs/expire`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-internal-token": process.env.INTERNAL_TOKEN ?? "" },
    body: JSON.stringify({ olderThan: new Date(Date.now() - maxAgeDays * 86_400_000).toISOString() }),
  });
  if (!res.ok) throw new Error(`expire request failed with ${res.status}`);
  return res.json();
}
