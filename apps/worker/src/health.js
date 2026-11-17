import http from "node:http";

/** Minimal liveness probe so Kubernetes can restart a wedged worker. */
export function startHealthServer(port = Number(process.env.WORKER_HEALTH_PORT ?? 9090)) {
  const state = { lastJobAt: Date.now() };
  const server = http.createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, lastJobAt: state.lastJobAt }));
      return;
    }
    res.writeHead(404).end();
  });
  server.listen(port);
  return { state, server };
}
