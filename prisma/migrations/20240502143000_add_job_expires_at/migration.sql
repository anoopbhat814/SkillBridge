ALTER TABLE "Job" ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "Job_status_expiresAt_idx" ON "Job"("status", "expiresAt");
