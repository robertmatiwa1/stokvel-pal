import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";

import { sendNotification } from "../notifications/notification.service";

enum JobStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

enum PaymentStatus {
  PENDING = "PENDING",
  ESCROW = "ESCROW",
  PAID = "PAID",
}

interface Job {
  id: string;
  customerId: string;
  providerId?: string;
  serviceType: string;
  notes?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  scheduledAt: string;
  suburb: string;
  priceCents: number;
  startedAt?: string;
  completedAt?: string;
  paymentStatus: PaymentStatus;
  providerPayoutCents: number;
  platformCommissionCents: number;
  paymentEscrowedAt?: string;
  paymentReleasedAt?: string;
}

type Role = "customer" | "provider" | undefined;

type StatusQuery = JobStatus | JobStatus[] | undefined;

const router = Router();

const jobs: Job[] = [];

const COMMISSION_RATE = 0.1;

const findJobById = (id: string): Job | undefined => {
  return jobs.find((item) => item.id === id);
};

const calculatePayouts = (amountCents: number): {
  providerPayoutCents: number;
  platformCommissionCents: number;
} => {
  const platformCommissionCents = Math.round(amountCents * COMMISSION_RATE);
  const providerPayoutCents = Math.max(0, amountCents - platformCommissionCents);

  return { providerPayoutCents, platformCommissionCents };
};

const movePaymentToEscrow = (job?: Job): Job | undefined => {
  if (!job || job.paymentStatus !== PaymentStatus.PENDING) {
    return undefined;
  }

  const { providerPayoutCents, platformCommissionCents } = calculatePayouts(job.priceCents);

  job.providerPayoutCents = providerPayoutCents;
  job.platformCommissionCents = platformCommissionCents;
  job.paymentStatus = PaymentStatus.ESCROW;
  job.paymentEscrowedAt = new Date().toISOString();

  return job;
};

const releasePayment = (job?: Job): Job | undefined => {
  if (!job || job.paymentStatus !== PaymentStatus.ESCROW) {
    return undefined;
  }

  job.paymentStatus = PaymentStatus.PAID;
  job.paymentReleasedAt = new Date().toISOString();

  return job;
};

const holdJobPaymentInEscrow = (jobId: string): Job | undefined => {
  return movePaymentToEscrow(findJobById(jobId));
};

const releaseJobPayment = (jobId: string): Job | undefined => {
  return releasePayment(findJobById(jobId));
};

const releasePaymentIfEligible = (job: Job): Job | undefined => {
  return releasePayment(job);
};

const suburbFallbacks = ["Sandton", "Rosebank", "Midrand", "Fourways"];

const jobPricing: Record<string, number> = {
  cleaning: 4500,
  plumbing: 6500,
  gardening: 3500,
  electrical: 7000,
};

const normaliseServiceType = (serviceType?: string): string => {
  if (!serviceType) {
    return "General";
  }
  return serviceType.trim();
};

const resolvePrice = (serviceType?: string): number => {
  if (!serviceType) {
    return 4000;
  }
  const key = serviceType.trim().toLowerCase();
  return jobPricing[key] ?? 4000;
};

const resolveSuburb = (indexSeed: number, suburb?: string): string => {
  if (suburb && suburb.trim().length > 0) {
    return suburb.trim();
  }
  return suburbFallbacks[indexSeed % suburbFallbacks.length];
};

const scheduleFor = (hoursAhead = 4): string => {
  return new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString();
};

const isStatusValid = (status: string): status is JobStatus => {
  return Object.values(JobStatus).includes(status as JobStatus);
};

router.post("/jobs", (req: Request, res: Response) => {
  const { customerId, serviceType, notes, suburb, providerId } = req.body as {
    customerId?: string;
    serviceType?: string;
    notes?: string;
    suburb?: string;
    providerId?: string;
  };

  if (!customerId) {
    return res.status(400).json({ message: "customerId is required" });
  }

  const nowIso = new Date().toISOString();
  const resolvedServiceType = normaliseServiceType(serviceType);

  const newJob: Job = {
    id: uuidv4(),
    customerId,
    providerId: undefined,
    serviceType: resolvedServiceType,
    notes,
    status: JobStatus.PENDING,
    createdAt: nowIso,
    updatedAt: nowIso,
    scheduledAt: scheduleFor(),
    suburb: resolveSuburb(jobs.length, suburb),
    priceCents: resolvePrice(serviceType),
    paymentStatus: PaymentStatus.PENDING,
    providerPayoutCents: 0,
    platformCommissionCents: 0,
  };

  jobs.unshift(newJob);

  const targetProviderId = providerId ?? newJob.providerId ?? "providers";
  sendNotification(
    targetProviderId,
    "job.requested",
    `New ${newJob.serviceType} job ${newJob.id} requested in ${newJob.suburb}.`,
  );

  return res.status(201).json(newJob);
});

router.get("/jobs", (req: Request, res: Response) => {
  const { role, userId, status } = req.query as {
    role?: Role;
    userId?: string;
    status?: StatusQuery;
  };

  let filteredJobs = [...jobs];

  if (role === "customer" && userId) {
    filteredJobs = filteredJobs.filter((job) => job.customerId === userId);
  } else if (role === "provider" && userId) {
    filteredJobs = filteredJobs.filter((job) => job.providerId === userId);
  }

  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    filteredJobs = filteredJobs.filter((job) => statuses.includes(job.status));
  }

  return res.json(filteredJobs);
});

router.patch("/jobs/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, providerId } = req.body as {
    status?: string;
    providerId?: string;
  };

  if (!status || !isStatusValid(status)) {
    return res.status(400).json({ message: "Valid status is required" });
  }

  const job = findJobById(id);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (status === JobStatus.ACCEPTED && providerId) {
    job.providerId = providerId;
  }

  const nowIso = new Date().toISOString();
  job.status = status;
  job.updatedAt = nowIso;

  if (status === JobStatus.IN_PROGRESS && !job.startedAt) {
    job.startedAt = nowIso;
  }

  if (status === JobStatus.COMPLETED) {
    job.completedAt = nowIso;
  }

  if (status === JobStatus.ACCEPTED) {
    sendNotification(
      job.customerId,
      "job.accepted",
      `Your job ${job.id} has been accepted${
        job.providerId ? ` by ${job.providerId}` : ""
      }.`,
    );
  }

  if (status === JobStatus.COMPLETED) {
    const released = releasePaymentIfEligible(job);
    if (released) {
      console.log(`[payments] Job ${job.id} payment released after completion.`);
      if (released.providerId) {
        sendNotification(
          released.providerId,
          "job.payout_released",
          `Payment for job ${released.id} has been released.`,
        );
      }
    }
  }

  return res.json(job);
});

export { JobStatus, PaymentStatus, findJobById, holdJobPaymentInEscrow, releaseJobPayment };
export default router;
