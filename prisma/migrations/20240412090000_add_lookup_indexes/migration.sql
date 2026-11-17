CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");
CREATE INDEX "Interview_applicationId_startsAt_idx" ON "Interview"("applicationId", "startsAt");
