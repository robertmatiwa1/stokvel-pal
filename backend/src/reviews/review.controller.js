import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

import { findJobById } from "../jobs/job.controller.js";

const router = Router();

const reviews = [];

const buildProviderSummary = (providerId) => {
  const providerReviews = reviews
    .filter((review) => review.providerId === providerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const reviewCount = providerReviews.length;
  const totalRating = providerReviews.reduce((total, review) => total + review.rating, 0);
  const averageRating = reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(2)) : 0;

  return {
    providerId,
    averageRating,
    reviewCount,
    reviews: providerReviews,
  };
};

router.post("/reviews", (req, res) => {
  const { jobId, rating, comment } = req.body ?? {};

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

  const review = {
    id: uuidv4(),
    jobId,
    providerId: job.providerId,
    rating: roundedRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
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

router.get("/reviews/provider/:providerId", (req, res) => {
  const { providerId } = req.params;

  if (!providerId) {
    return res.status(400).json({ message: "providerId is required" });
  }

  const summary = buildProviderSummary(providerId);
  return res.json(summary);
});

export default router;
