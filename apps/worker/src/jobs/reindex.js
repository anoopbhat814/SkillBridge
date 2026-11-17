const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8080";

/** Pushes a job or candidate document to the Go search indexer. */
export async function handleReindex({ kind, id, document }) {
  const res = await fetch(`${GATEWAY_URL}/index/${kind}/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(document),
  });
  if (!res.ok) throw new Error(`indexer responded ${res.status}`);
}
