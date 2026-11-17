CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "gpa" DECIMAL(3,2),
    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_experiences" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "workMode" "WorkMode" NOT NULL DEFAULT 'ONSITE',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "summary" TEXT,
    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "issuedAt" DATE NOT NULL,
    "expiresAt" DATE,
    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "skill_endorsements" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "endorserId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "skill_endorsements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "educations_candidateId_startYear_idx" ON "educations"("candidateId", "startYear");
CREATE INDEX "work_experiences_candidateId_startDate_idx" ON "work_experiences"("candidateId", "startDate");
CREATE INDEX "certifications_expiresAt_idx" ON "certifications"("expiresAt");
CREATE UNIQUE INDEX "certifications_candidateId_issuer_credentialId_key" ON "certifications"("candidateId", "issuer", "credentialId");
CREATE INDEX "skill_endorsements_candidateId_skillId_idx" ON "skill_endorsements"("candidateId", "skillId");
CREATE UNIQUE INDEX "skill_endorsements_candidateId_skillId_endorserId_key" ON "skill_endorsements"("candidateId", "skillId", "endorserId");

ALTER TABLE "educations" ADD CONSTRAINT "educations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_endorserId_fkey" FOREIGN KEY ("endorserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
