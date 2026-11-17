import { PrismaClient, SkillLevel, JobStatus, WorkMode } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

const SKILLS: Array<[string, string]> = [
  ["TypeScript", "Languages"],
  ["Python", "Languages"],
  ["Go", "Languages"],
  ["React", "Frontend"],
  ["PostgreSQL", "Data"],
  ["Kubernetes", "Infrastructure"],
  ["Machine Learning", "Data"],
];

function hash(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

async function main() {
  const skills = await Promise.all(
    SKILLS.map(([name, category]) =>
      prisma.skill.upsert({ where: { name }, update: {}, create: { name, category } }),
    ),
  );
  const byName = Object.fromEntries(skills.map((s) => [s.name, s]));

  const employer = await prisma.employer.create({
    data: { name: "Northwind Labs", website: "https://northwind.example", industry: "Software" },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@northwind.example" },
    update: {},
    create: {
      email: "recruiter@northwind.example",
      passwordHash: hash("demo-password"),
      role: "EMPLOYER",
      employerMember: { create: { employerId: employer.id, title: "Talent Lead" } },
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { email: "ada@example.com" },
    update: {},
    create: {
      email: "ada@example.com",
      passwordHash: hash("demo-password"),
      candidate: {
        create: {
          fullName: "Ada Okafor",
          headline: "Full-stack engineer",
          location: "Lagos, NG",
          yearsExperience: 6,
          skills: {
            create: [
              { skillId: byName["TypeScript"].id, level: SkillLevel.EXPERT, verified: true },
              { skillId: byName["React"].id, level: SkillLevel.ADVANCED },
            ],
          },
        },
      },
    },
  });

  await prisma.job.create({
    data: {
      employerId: employer.id,
      title: "Senior Frontend Engineer",
      description: "Build the next generation of our analytics dashboards.",
      workMode: WorkMode.REMOTE,
      salaryMin: 110000,
      salaryMax: 150000,
      status: JobStatus.OPEN,
      postedAt: new Date(),
      skills: {
        create: [
          { skillId: byName["TypeScript"].id, minLevel: SkillLevel.ADVANCED },
          { skillId: byName["React"].id, minLevel: SkillLevel.ADVANCED },
        ],
      },
    },
  });

  console.log(`Seeded recruiter ${recruiter.email} and candidate ${candidateUser.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
