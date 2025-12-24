import { apiRequest } from "./apiClient";
import { saveToken, clearToken, getToken } from "./tokenStore";

/**
 * Re-export token helpers so screens can import from one place
 */
export { saveToken, clearToken, getToken };

/**
 * Types
 */
export type AuthResponse = {
  token: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
};

export type Member = {
  id: string;
  username: string;
  phone: string;
  joined_at: string;
};

/**
 * Auth
 */
export function login(phone: string, pin: string) {
  return apiRequest<AuthResponse>("/auth/login", "POST", { phone, pin }, false);
}

export function register(phone: string, pin: string, username: string) {
  return apiRequest<AuthResponse>("/auth/register", "POST", { phone, pin, username }, false);
}

/**
 * Groups
 */
export function listGroups() {
  return apiRequest<Group[]>("/groups", "GET");
}

export function createGroup(name: string, description?: string) {
  return apiRequest<Group>("/groups", "POST", { name, description });
}

export function getGroup(groupId: string) {
  return apiRequest<Group>(`/groups/${groupId}`, "GET");
}

/**
 * Memberships
 */
export function joinGroup(groupId: string) {
  return apiRequest<any>(`/memberships/join/${groupId}`, "POST", {});
}

export function listMembers(groupId: string) {
  return apiRequest<Member[]>(`/memberships/group/${groupId}`, "GET");
}

export function addMember(groupId: string, username: string, phone: string) {
  return apiRequest<any>(`/memberships/add/${groupId}`, "POST", { username, phone });
}

export type GroupRole = "admin" | "member";

export function getMyRoleInGroup(groupId: string) {
  return apiRequest<{ role: GroupRole }>(`/memberships/role/${groupId}`, "GET");
}

/**
 * Contributions
 */
export type Contribution = {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  amount: string | number;
  paid_at: string;
  note?: string | null;
  created_at: string;
};

export type GroupContributionsResponse = {
  total: string;
  totalsByMember: { user_id: string; username: string; total: string }[];
  items: Contribution[];
};

export function listContributionsByGroup(groupId: string) {
  return apiRequest<GroupContributionsResponse>(`/contributions/group/${groupId}`, "GET");
}

export function addContribution(payload: {
  group_id: string;
  user_id: string;
  amount: number;
  paid_at?: string;
  note?: string;
}) {
  return apiRequest<Contribution>("/contributions", "POST", payload);
}

/**
 * Monthly summaries
 */
export type MonthlySummaryRow = {
  month: string; // "2025-01"
  in_total: number; // money in
  out_total: number; // money out (0 for now)
  net: number; // in_total - out_total
  tx_count: number; // number of transactions
};

export function getMonthlySummary(groupId: string, year: number) {
  return apiRequest<MonthlySummaryRow[]>(`/groups/${groupId}/monthly-summary?year=${year}`, "GET");
}
