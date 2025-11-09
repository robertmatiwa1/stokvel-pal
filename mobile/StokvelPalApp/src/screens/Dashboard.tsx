import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";
const CUSTOMER_ID = "customer-1";

export type JobStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type Job = {
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
};

type ProviderReview = {
  id: string;
  jobId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ProviderReviewSummary = {
  providerId: string;
  averageRating: number;
  reviewCount: number;
  reviews: ProviderReview[];
};

type CreateReviewResponse = {
  review: ProviderReview;
  providerRating: {
    providerId: string;
    averageRating: number;
    reviewCount: number;
  };
};

const statusColours: Record<JobStatus, string> = {
  PENDING: "#F0AD4E",
  ACCEPTED: "#0275D8",
  IN_PROGRESS: "#5BC0DE",
  COMPLETED: "#5CB85C",
  CANCELLED: "#C9302C",
};

const readableStatus: Record<JobStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const formatCurrency = (value: number) => `R ${(value / 100).toFixed(2)}`;

const isActiveStatus = (status: JobStatus) =>
  status === "PENDING" || status === "ACCEPTED" || status === "IN_PROGRESS";

const isPastStatus = (status: JobStatus) => status === "COMPLETED" || status === "CANCELLED";

const StatusBadge = ({ status }: { status: JobStatus }) => (
  <View style={[styles.badge, { backgroundColor: statusColours[status] }]}>
    <Text style={styles.badgeText}>{readableStatus[status]}</Text>
  </View>
);

const ratingOptions = [1, 2, 3, 4, 5];

export default function Dashboard() {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [providerSummaries, setProviderSummaries] = useState<
    Record<string, ProviderReviewSummary>
  >({});
  const [pendingReviewJob, setPendingReviewJob] = useState<Job | null>(null);
  const [isRateModalVisible, setIsRateModalVisible] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [dismissedReviewJobs, setDismissedReviewJobs] = useState<string[]>([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/jobs?role=customer&userId=${encodeURIComponent(CUSTOMER_ID)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load jobs");
      }

      const data: Job[] = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, [fetchJobs]);

  const fetchProviderSummary = useCallback(async (providerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/provider/${providerId}`);

      if (!response.ok) {
        throw new Error("Unable to load provider reviews");
      }

      const summary = (await response.json()) as ProviderReviewSummary;
      setProviderSummaries((prev) => ({ ...prev, [providerId]: summary }));
    } catch (err) {
      console.warn(`Failed to load reviews for provider ${providerId}`, err);
    }
  }, []);

  useEffect(() => {
    const providerIds = Array.from(
      new Set(
        jobs
          .map((job) => job.providerId)
          .filter((providerId): providerId is string => Boolean(providerId)),
      ),
    );

    providerIds.forEach((providerId) => {
      if (!providerSummaries[providerId]) {
        fetchProviderSummary(providerId);
      }
    });
  }, [jobs, providerSummaries, fetchProviderSummary]);

  const reviewedJobIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(providerSummaries).forEach((summary) => {
      summary.reviews.forEach((review) => ids.add(review.jobId));
    });
    return ids;
  }, [providerSummaries]);

  const pendingReviewSummary = useMemo(() => {
    if (!pendingReviewJob?.providerId) {
      return undefined;
    }

    return providerSummaries[pendingReviewJob.providerId];
  }, [pendingReviewJob, providerSummaries]);

  const openRateModal = useCallback((job: Job) => {
    setPendingReviewJob(job);
    setSelectedRating(5);
    setReviewComment("");
    setIsRateModalVisible(true);
    setDismissedReviewJobs((prev) => prev.filter((id) => id !== job.id));
  }, []);

  const handleSkipReview = useCallback(() => {
    if (pendingReviewJob) {
      setDismissedReviewJobs((prev) =>
        prev.includes(pendingReviewJob.id) ? prev : [...prev, pendingReviewJob.id],
      );
    }
    setIsRateModalVisible(false);
    setPendingReviewJob(null);
    setReviewComment("");
    setSelectedRating(5);
  }, [pendingReviewJob]);

  const submitReview = useCallback(async () => {
    if (!pendingReviewJob || !pendingReviewJob.providerId) {
      return;
    }

    const trimmedComment = reviewComment.trim();

    if (!trimmedComment) {
      Alert.alert("Comment required", "Please share a short comment about your experience.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: pendingReviewJob.id,
          rating: selectedRating,
          comment: trimmedComment,
        }),
      });

      const payloadJson = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payloadJson as { message?: string } | null)?.message ??
          "Unable to submit review";
        throw new Error(message);
      }

      if (!payloadJson) {
        throw new Error("Unexpected response from review service");
      }

      const payload = payloadJson as CreateReviewResponse;

      setProviderSummaries((prev) => {
        const existingSummary = prev[payload.providerRating.providerId];
        const existingReviews = existingSummary?.reviews ?? [];
        const filteredReviews = existingReviews.filter(
          (review) => review.jobId !== payload.review.jobId,
        );
        const updatedReviews = [payload.review, ...filteredReviews];

        const nextReviewCount = Math.max(
          payload.providerRating.reviewCount,
          updatedReviews.length,
        );

        const updatedSummary: ProviderReviewSummary = {
          providerId: payload.providerRating.providerId,
          averageRating: payload.providerRating.averageRating,
          reviewCount: nextReviewCount,
          reviews: updatedReviews,
        };

        return { ...prev, [payload.providerRating.providerId]: updatedSummary };
      });

      setIsRateModalVisible(false);
      setPendingReviewJob(null);
      setReviewComment("");
      setSelectedRating(5);
      setDismissedReviewJobs((prev) => prev.filter((id) => id !== pendingReviewJob.id));

      Alert.alert("Thank you!", "Your review has been submitted.");
    } catch (err) {
      console.error("Failed to submit review", err);
      Alert.alert(
        "Unable to submit review",
        err instanceof Error ? err.message : "Unexpected error",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  }, [pendingReviewJob, reviewComment, selectedRating]);

  useEffect(() => {
    if (isRateModalVisible) {
      return;
    }

    const jobToReview = jobs.find(
      (job) =>
        job.status === "COMPLETED" &&
        job.providerId &&
        !reviewedJobIds.has(job.id) &&
        !dismissedReviewJobs.includes(job.id),
    );

    if (jobToReview) {
      openRateModal(jobToReview);
    } else if (pendingReviewJob) {
      setPendingReviewJob(null);
    }
  }, [
    jobs,
    reviewedJobIds,
    dismissedReviewJobs,
    isRateModalVisible,
    openRateModal,
    pendingReviewJob,
  ]);

  const renderProviderDetails = useCallback(
    (job: Job) => {
      if (!job.providerId) {
        return null;
      }

      const summary = providerSummaries[job.providerId];

      return (
        <View style={styles.providerContainer}>
          <Text style={styles.providerLabel}>Provider: {job.providerId}</Text>
          {summary ? (
            summary.reviewCount > 0 ? (
              <Text style={styles.providerRatingText}>
                Rating {summary.averageRating.toFixed(1)} ({summary.reviewCount}{" "}
                {summary.reviewCount === 1 ? "review" : "reviews"})
              </Text>
            ) : (
              <Text style={styles.providerRatingText}>No ratings yet</Text>
            )
          ) : (
            <Text style={styles.providerRatingText}>Loading rating…</Text>
          )}
        </View>
      );
    },
    [providerSummaries],
  );

  const renderRateCallToAction = useCallback(
    (job: Job) => {
      if (job.status !== "COMPLETED" || !job.providerId || reviewedJobIds.has(job.id)) {
        return null;
      }

      return (
        <TouchableOpacity style={styles.rateButton} onPress={() => openRateModal(job)}>
          <Text style={styles.rateButtonText}>Rate Provider</Text>
        </TouchableOpacity>
      );
    },
    [openRateModal, reviewedJobIds],
  );

  const activeJobs = useMemo(() => jobs.filter((job) => isActiveStatus(job.status)), [jobs]);
  const pastJobs = useMemo(() => jobs.filter((job) => isPastStatus(job.status)), [jobs]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("Booking" as never)}
        >
          <Text style={styles.bookButtonText}>New Booking</Text>
        </TouchableOpacity>
      </View>

      {loading && jobs.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0275D8" />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Active Jobs</Text>
              {activeJobs.length === 0 ? (
                <Text style={styles.emptyText}>No active jobs yet.</Text>
              ) : (
                activeJobs.map((job) => (
                  <View key={job.id} style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobTitle}>{job.serviceType}</Text>
                      <StatusBadge status={job.status} />
                    </View>
                    <Text style={styles.jobDetail}>Scheduled: {new Date(job.scheduledAt).toLocaleString()}</Text>
                    <Text style={styles.jobDetail}>Suburb: {job.suburb}</Text>
                    <Text style={styles.jobDetail}>{formatCurrency(job.priceCents)}</Text>
                    {job.notes ? (
                      <Text style={styles.jobNotes}>Notes: {job.notes}</Text>
                    ) : null}
                    {renderProviderDetails(job)}
                    {renderRateCallToAction(job)}
                  </View>
                ))
              )}

              <Text style={styles.sectionTitle}>Past Jobs</Text>
              {pastJobs.length === 0 ? (
                <Text style={styles.emptyText}>No completed jobs yet.</Text>
              ) : (
                pastJobs.map((job) => (
                  <View key={job.id} style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobTitle}>{job.serviceType}</Text>
                      <StatusBadge status={job.status} />
                    </View>
                    <Text style={styles.jobDetail}>Completed: {new Date(job.updatedAt).toLocaleString()}</Text>
                    <Text style={styles.jobDetail}>Suburb: {job.suburb}</Text>
                    <Text style={styles.jobDetail}>{formatCurrency(job.priceCents)}</Text>
                    {renderProviderDetails(job)}
                    {renderRateCallToAction(job)}
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
      <Modal visible={isRateModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate your provider</Text>
            {pendingReviewJob ? (
              <View style={styles.modalJobSummary}>
                <Text style={styles.modalSubtitle}>
                  {pendingReviewJob.providerId
                    ? `How was your experience with ${pendingReviewJob.providerId}?`
                    : "How was your provider?"}
                </Text>
                <Text style={styles.modalJobDetail}>
                  {pendingReviewJob.serviceType} • {new Date(pendingReviewJob.updatedAt).toLocaleString()}
                </Text>
                {pendingReviewSummary ? (
                  pendingReviewSummary.reviewCount > 0 ? (
                    <Text style={styles.modalHint}>
                      Current rating {pendingReviewSummary.averageRating.toFixed(1)} from {pendingReviewSummary.reviewCount}{" "}
                      {pendingReviewSummary.reviewCount === 1 ? "review" : "reviews"}.
                    </Text>
                  ) : (
                    <Text style={styles.modalHint}>Be the first to review this provider.</Text>
                  )
                ) : null}
              </View>
            ) : null}
            <Text style={styles.modalLabel}>Select a rating</Text>
            <View style={styles.ratingRow}>
              {ratingOptions.map((value) => {
                const isSelected = value === selectedRating;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.ratingButton, isSelected && styles.ratingButtonSelected]}
                    onPress={() => setSelectedRating(value)}
                    disabled={isSubmittingReview}
                  >
                    <Text
                      style={[styles.ratingButtonText, isSelected && styles.ratingButtonTextSelected]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.modalLabel}>Tell us more</Text>
            <TextInput
              style={styles.commentInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              editable={!isSubmittingReview}
              placeholder="Share a few details about the service"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipReview}
                disabled={isSubmittingReview}
              >
                <Text style={styles.skipButtonText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitReviewButton,
                  isSubmittingReview && styles.submitReviewButtonDisabled,
                ]}
                onPress={submitReview}
                disabled={isSubmittingReview}
              >
                <Text style={styles.submitReviewButtonText}>
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  bookButton: {
    backgroundColor: "#0275D8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sectionContainer: {
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#1C1C1E",
  },
  emptyText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  jobDetail: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 4,
  },
  jobNotes: {
    fontSize: 13,
    color: "#4A4A4A",
    marginTop: 4,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    color: "#C9302C",
    marginVertical: 12,
    fontSize: 14,
  },
  providerContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F2F7FF",
    borderRadius: 10,
  },
  providerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  providerRatingText: {
    marginTop: 4,
    fontSize: 13,
    color: "#4A4A4A",
  },
  rateButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#0275D8",
  },
  rateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  modalJobSummary: {
    marginBottom: 16,
  },
  modalJobDetail: {
    marginTop: 4,
    fontSize: 14,
    color: "#4A4A4A",
  },
  modalHint: {
    marginTop: 6,
    fontSize: 13,
    color: "#6C757D",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ratingButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CED4DA",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  ratingButtonSelected: {
    backgroundColor: "#0275D8",
    borderColor: "#0275D8",
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0275D8",
  },
  ratingButtonTextSelected: {
    color: "#FFFFFF",
  },
  commentInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#CED4DA",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    color: "#1C1C1E",
    backgroundColor: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4A4A",
  },
  submitReviewButton: {
    marginLeft: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#0275D8",
  },
  submitReviewButtonDisabled: {
    opacity: 0.65,
  },
  submitReviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
