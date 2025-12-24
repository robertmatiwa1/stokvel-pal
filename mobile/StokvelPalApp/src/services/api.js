const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getGroups() {
  const res = await fetch(`${API_URL}/api/groups`);
  if (!res.ok) {
    throw new Error("Failed to fetch groups");
  }
  return res.json();
}
