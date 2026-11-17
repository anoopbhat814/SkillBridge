import { prisma } from "../lib/prisma";

export interface RatingSummary {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** Pure helper so the aggregation can be tested without a database. */
export function summarizeRatings(ratings: number[]): RatingSummary {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as RatingSummary["distribution"];
  let sum = 0;
  for (const r of ratings) {
    if (r >= 1 && r <= 5) {
      distribution[r as 1 | 2 | 3 | 4 | 5]++;
      sum += r;
    }
  }
  const count = Object.values(distribution).reduce((a, b) => a + b, 0);
  return { count, average: count ? Math.round((sum / count) * 100) / 100 : 0, distribution };
}

export async function employerReviews(employerId: string, take = 20) {
  const reviews = await prisma.review.findMany({
    where: { employerId },
    orderBy: { createdAt: "desc" },
    take,
    include: { author: { select: { id: true, candidate: { select: { fullName: true } } } } },
  });
  const summary = summarizeRatings(reviews.map((r) => r.rating));
  return {
    summary,
    reviews: reviews.map(({ author, ...r }) => ({
      ...r,
      authorName: r.anonymous ? "Anonymous" : (author.candidate?.fullName ?? "Member"),
    })),
  };
}
