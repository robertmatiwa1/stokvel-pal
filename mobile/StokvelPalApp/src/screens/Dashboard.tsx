import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

export default function Dashboard() {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
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
});
