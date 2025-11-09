import { Router } from "express";

import { createCheckout } from "./payment.service.js";
import {
  PaymentStatus,
  findJobById,
  holdJobPaymentInEscrow,
  releaseJobPayment,
} from "../jobs/job.controller.js";

const router = Router();

const resolveNextStatus = (status, event) => {
  if (typeof status === "string" && status.trim().length > 0) {
    return status.trim().toUpperCase();
  }

  if (typeof event === "string" && event.trim().length > 0) {
    const normalised = event.trim().toLowerCase();

    if (
      normalised.includes("escrow") ||
      normalised.includes("payment_success") ||
      normalised.includes("payment_completed")
    ) {
      return PaymentStatus.ESCROW;
    }

    if (normalised.includes("paid") || normalised.includes("release")) {
      return PaymentStatus.PAID;
    }
  }

  return undefined;
};

router.post("/payments/checkout", (req, res) => {
  const { jobId, amountCents } = req.body ?? {};

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ message: "jobId is required" });
  }

  const job = findJobById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const parsedAmount = Number(amountCents);
  const amount = Number.isFinite(parsedAmount) ? parsedAmount : job.priceCents;
  const { checkoutUrl } = createCheckout(jobId, amount);

  return res.json({ checkoutUrl });
});

router.post("/payments/webhook", (req, res) => {
  const { jobId, status, event } = req.body ?? {};

  if (!jobId || typeof jobId !== "string") {
    return res.status(400).json({ message: "jobId is required" });
  }

  const job = findJobById(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const nextStatus = resolveNextStatus(status, event);

  if (!nextStatus) {
    return res.status(400).json({ message: "Unable to determine payment status from payload" });
  }

  if (nextStatus === PaymentStatus.ESCROW) {
    const updated = holdJobPaymentInEscrow(jobId);

    if (!updated) {
      return res.status(409).json({ message: "Payment already escrowed or released" });
    }

    return res.json({ message: "Payment moved to escrow", job: updated });
  }

  if (nextStatus === PaymentStatus.PAID) {
    const updated = releaseJobPayment(jobId);

    if (!updated) {
      return res
        .status(409)
        .json({ message: "Payment has not been escrowed yet or is already released" });
    }

    return res.json({ message: "Payment released to provider", job: updated });
  }

  return res.status(400).json({ message: "Unsupported payment status" });
});

export default router;
