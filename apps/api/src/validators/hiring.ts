import { z } from "zod";

export const offerInput = z.object({
  applicationId: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  salary: z.number().int().positive().max(5_000_000),
  currency: z.string().length(3).toUpperCase().default("USD"),
  equityPercent: z.number().min(0).max(100).optional(),
  startDate: z.coerce.date().optional(),
  expiresInDays: z.number().int().min(1).max(60).default(7),
});

export const offerResponse = z.object({ decision: z.enum(["ACCEPT", "DECLINE"]) });

export const reviewInput = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(20).max(4000),
  anonymous: z.boolean().default(false),
});

export const referralInput = z.object({
  jobId: z.string().min(1),
  refereeEmail: z.string().email().toLowerCase(),
});

export const feedbackInput = z.object({
  technicalScore: z.number().int().min(1).max(5),
  communicationScore: z.number().int().min(1).max(5),
  recommendation: z.boolean(),
  comments: z.string().trim().max(3000).optional(),
});

export const endorsementInput = z.object({
  skillId: z.string().min(1),
  note: z.string().trim().max(280).optional(),
});

export const alertInput = z.object({
  query: z.string().trim().min(2).max(120),
  location: z.string().trim().max(120).optional(),
  workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]).optional(),
  minSalary: z.number().int().nonnegative().optional(),
  frequency: z.enum(["INSTANT", "DAILY", "WEEKLY"]).default("DAILY"),
});

export const pushSubscriptionInput = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(10), auth: z.string().min(8) }),
});
