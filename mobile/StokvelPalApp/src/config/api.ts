import Constants from "expo-constants";

function getHost(): string {
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.hostUri;

  if (typeof hostUri === "string" && hostUri.includes(":")) {
    return hostUri.split(":")[0];
  }

  // Fallback, replace with your PC IPv4 from ipconfig
  return "192.168.0.179";
}

export const API_BASE_URL = `http://${getHost()}:5000/api`;
