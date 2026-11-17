import { prisma } from "../lib/prisma";
import type { SkillLevel } from "@skillbridge/types";

function levelForScore(score: number): SkillLevel {
  if (score >= 95) return "EXPERT";
  if (score >= 85) return "ADVANCED";
  if (score >= 70) return "INTERMEDIATE";
  return "BEGINNER";
}

export async function gradeAttempt(
  assessmentId: string,
  candidateId: string,
  answers: Record<string, number>,
) {
  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: { id: assessmentId },
    include: { questions: true },
  });

  const totalWeight = assessment.questions.reduce((s, q) => s + q.weight, 0);
  const earned = assessment.questions.reduce(
    (s, q) => s + (answers[q.id] === q.correctIndex ? q.weight : 0),
    0,
  );
  const score = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100);
  const passed = score >= assessment.passScore;

  const attempt = await prisma.assessmentAttempt.create({
    data: { assessmentId, candidateId, score, passed, answers },
  });

  if (passed) {
    await prisma.candidateSkill.upsert({
      where: { candidateId_skillId: { candidateId, skillId: assessment.skillId } },
      update: { verified: true, level: levelForScore(score) },
      create: { candidateId, skillId: assessment.skillId, verified: true, level: levelForScore(score) },
    });
  }
  return attempt;
}
