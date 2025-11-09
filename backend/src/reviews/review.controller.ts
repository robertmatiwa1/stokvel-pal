import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";

import { findJobById } from "../jobs/job.controller";

type Review = {
  id: string;
  jobId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ProviderRatingSummary = {
  providerId: string;
  averageRating: number;
  reviewCount: number;
};

type ProviderReviewResponse = ProviderRatingSummary & {
  reviews: Review[];
};

const router = Router();

const reviews: Review[] = [];

const buildProviderSummary = (providerId: string): ProviderReviewResponse => {
  const providerReviews = reviews
    .filter((review) => review.providerId === providerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const reviewCount = providerReviews.length;
  const totalRating = providerReviews.reduce((total, review) => total + review.rating, 0);
  const averageRating =
    reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(2)) : 0;

  return {
    providerId,
    averageRating,
    reviewCount,
    reviews: providerReviews,
  };
};

router.post("/reviews", (req: Request, res: Response) => {
  const { jobId, rating, comment } = req.body as {
    jobId?: string;
    rating?: number;
    comment?: string;
  };

  if (!jobId) {
    return res.status(400).json({ message: "jobId is required" });
  }

  if (typeof rating !== "number" || Number.isNaN(rating)) {
    return res.status(400).json({ message: "rating must be a number between 1 and 5" });
  }

  const roundedRating = Math.round(rating);
  if (roundedRating < 1 || roundedRating > 5) {
    return res.status(400).json({ message: "rating must be between 1 and 5" });
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return res.status(400).json({ message: "comment is required" });
  }

  const existingReview = reviews.find((review) => review.jobId === jobId);
  if (existingReview) {
    return res.status(409).json({ message: "This job has already been reviewed" });
  }

  const job = findJobById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!job.providerId) {
    return res
      .status(400)
      .json({ message: "Job does not have an assigned provider to review" });
  }

  if (job.status !== "COMPLETED") {
    return res.status(400).json({ message: "Only completed jobs can be reviewed" });
  }

  const nowIso = new Date().toISOString();
  const review: Review = {
    id: uuidv4(),
    jobId,
    providerId: job.providerId,
    rating: roundedRating,
    comment: comment.trim(),
    createdAt: nowIso,
  };

  reviews.unshift(review);
  const summary = buildProviderSummary(job.providerId);

  return res.status(201).json({
    review,
    providerRating: {
      providerId: summary.providerId,
      averageRating: summary.averageRating,
      reviewCount: summary.reviewCount,
    },
  });
});

router.get("/reviews/provider/:providerId", (req: Request, res: Response) => {
  const { providerId } = req.params;

  if (!providerId) {
    return res.status(400).json({ message: "providerId is required" });
  }

  const summary = buildProviderSummary(providerId);
  return res.json(summary);
});

export default router;
