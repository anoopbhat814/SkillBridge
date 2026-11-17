import express from "express";
import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { applicationsRouter } from "./routes/applications";
import { assessmentsRouter } from "./routes/assessments";
import { interviewsRouter } from "./routes/interviews";
import { messagesRouter } from "./routes/messages";
import { profileRouter } from "./routes/profile";
import { offersRouter } from "./routes/offers";
import { communityRouter } from "./routes/community";
import { dashboardRouter } from "./routes/dashboard";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/auth";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/healthz", (_req, res) => res.json({ ok: true }));
  app.use("/auth", authRouter);
  app.use("/jobs", jobsRouter);
  app.use("/applications", requireAuth(), applicationsRouter);
  app.use("/assessments", requireAuth(), assessmentsRouter);
  app.use("/interviews", requireAuth(), interviewsRouter);
  app.use("/messages", requireAuth(), messagesRouter);
  app.use("/profile", requireAuth("CANDIDATE"), profileRouter);
  app.use("/offers", requireAuth(), offersRouter);
  app.use("/", requireAuth(), communityRouter);
  app.use("/dashboard", requireAuth("EMPLOYER"), dashboardRouter);

  app.use(errorHandler);
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 4000);
  createApp().listen(port, () => console.log(`SkillBridge API listening on :${port}`));
}
