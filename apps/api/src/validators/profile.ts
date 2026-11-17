import { z } from "zod";

const year = z.number().int().min(1950).max(new Date().getFullYear() + 8);

export const educationInput = z
  .object({
    institution: z.string().trim().min(2).max(120),
    degree: z.string().trim().min(2).max(80),
    fieldOfStudy: z.string().trim().max(80).optional(),
    startYear: year,
    endYear: year.optional(),
    gpa: z.number().min(0).max(4).optional(),
  })
  .refine((v) => v.endYear === undefined || v.endYear >= v.startYear, {
    message: "endYear must not precede startYear",
    path: ["endYear"],
  });

export const experienceInput = z
  .object({
    company: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(120),
    location: z.string().trim().max(120).optional(),
    workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]).default("ONSITE"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    summary: z.string().trim().max(2000).optional(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "endDate must not precede startDate",
    path: ["endDate"],
  });

export const certificationInput = z
  .object({
    name: z.string().trim().min(2).max(160),
    issuer: z.string().trim().min(2).max(120),
    credentialId: z.string().trim().max(80).optional(),
    credentialUrl: z.string().url().optional(),
    issuedAt: z.coerce.date(),
    expiresAt: z.coerce.date().optional(),
  })
  .refine((v) => !v.expiresAt || v.expiresAt > v.issuedAt, {
    message: "expiresAt must be after issuedAt",
    path: ["expiresAt"],
  });

export type EducationInput = z.infer<typeof educationInput>;
export type ExperienceInput = z.infer<typeof experienceInput>;
export type CertificationInput = z.infer<typeof certificationInput>;
