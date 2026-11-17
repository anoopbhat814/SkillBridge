import { PrismaClient, SkillLevel, JobStatus, WorkMode, OfferStatus, NotificationType, NotificationChannel, AlertFrequency } from "@prisma/client";
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

  const job = await prisma.job.create({
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

  const profile = await prisma.candidateProfile.findUniqueOrThrow({ where: { userId: candidateUser.id } });

  await prisma.education.create({
    data: { candidateId: profile.id, institution: "University of Lagos", degree: "BSc", fieldOfStudy: "Computer Science", startYear: 2012, endYear: 2016 },
  });
  await prisma.workExperience.create({
    data: {
      candidateId: profile.id,
      company: "Paystack Labs",
      title: "Software Engineer",
      workMode: WorkMode.HYBRID,
      startDate: new Date("2018-03-01"),
      summary: "Built payment dashboards in React and TypeScript.",
    },
  });
  await prisma.certification.create({
    data: {
      candidateId: profile.id,
      name: "Certified Kubernetes Application Developer",
      issuer: "CNCF",
      credentialId: "CKAD-DEMO-0001",
      issuedAt: new Date("2022-06-15"),
      expiresAt: new Date("2025-06-15"),
    },
  });
  await prisma.skillEndorsement.create({
    data: { candidateId: profile.id, skillId: byName["TypeScript"].id, endorserId: recruiter.id, note: "Strong typing instincts." },
  });
  await prisma.jobAlert.create({
    data: { candidateId: profile.id, query: "frontend engineer", workMode: WorkMode.REMOTE, minSalary: 100000, frequency: AlertFrequency.DAILY },
  });

  const application = await prisma.application.create({
    data: { jobId: job.id, candidateId: profile.id, status: "OFFER", matchScore: 0.91 },
  });
  await prisma.offer.create({
    data: {
      applicationId: application.id,
      title: "Senior Frontend Engineer",
      salary: 135000,
      status: OfferStatus.SENT,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });
  await prisma.review.create({
    data: { employerId: employer.id, authorId: candidateUser.id, rating: 4, title: "Thoughtful hiring process", body: "Clear communication at every stage." },
  });
  await prisma.referral.create({
    data: { jobId: job.id, referrerId: candidateUser.id, refereeEmail: "friend@example.com", code: "REF-ADA-0001" },
  });
  await prisma.notification.create({
    data: {
      userId: candidateUser.id,
      type: NotificationType.OFFER_RECEIVED,
      channel: NotificationChannel.IN_APP,
      title: "You have a new offer",
      body: "Northwind Labs sent you an offer for Senior Frontend Engineer.",
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
