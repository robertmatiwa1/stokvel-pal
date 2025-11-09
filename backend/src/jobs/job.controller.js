import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

export const JobStatus = Object.freeze({
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
});

const router = Router();

const jobs = [];

const suburbFallbacks = ["Sandton", "Rosebank", "Midrand", "Fourways"];

const jobPricing = {
  cleaning: 4500,
  plumbing: 6500,
  gardening: 3500,
  electrical: 7000,
};

const normaliseServiceType = (serviceType) => {
  if (!serviceType) {
    return "General";
  }
  return serviceType.trim();
};

const resolvePrice = (serviceType) => {
  if (!serviceType) {
    return 4000;
  }
  const key = serviceType.trim().toLowerCase();
  return jobPricing[key] ?? 4000;
};

const resolveSuburb = (indexSeed, suburb) => {
  if (suburb && suburb.trim().length > 0) {
    return suburb.trim();
  }
  return suburbFallbacks[indexSeed % suburbFallbacks.length];
};

const scheduleFor = (hoursAhead = 4) => {
  return new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString();
};

const isStatusValid = (status) => {
  return Object.values(JobStatus).includes(status);
};

const logPushNotification = (message) => {
  // Placeholder for future integration with push notifications
  console.log(`[push] ${message}`);
};

router.post("/jobs", (req, res) => {
  const { customerId, serviceType, notes, suburb } = req.body;

  if (!customerId) {
    return res.status(400).json({ message: "customerId is required" });
  }

  const nowIso = new Date().toISOString();
  const resolvedServiceType = normaliseServiceType(serviceType);

  const newJob = {
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
  };

  jobs.unshift(newJob);

  return res.status(201).json(newJob);
});

router.get("/jobs", (req, res) => {
  const { role, userId, status } = req.query;

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

router.patch("/jobs/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, providerId } = req.body;

  if (!status || !isStatusValid(status)) {
    return res.status(400).json({ message: "Valid status is required" });
  }

  const job = jobs.find((item) => item.id === id);

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
    logPushNotification(`Job ${job.id} accepted${job.providerId ? ` by ${job.providerId}` : ""}.`);
  }

  if (status === JobStatus.COMPLETED) {
    logPushNotification(`Job ${job.id} completed.`);
  }

  return res.json(job);
});

export default router;
