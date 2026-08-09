import Constants from "expo-constants";
import { Platform } from "react-native";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Resolve API base URL for local dev:
 * - Physical phone on Wi‑Fi → EXPO_PUBLIC_API_URL (your PC LAN IP)
 * - iOS Simulator → localhost:3001
 * - Android Emulator → 10.0.2.2:3001
 */
function resolveApiUrl(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL ??
    Constants.expoConfig?.extra?.apiUrl;

  if (!fromEnv) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:3001"
      : "http://localhost:3001";
  }

  const envUrl = stripTrailingSlash(String(fromEnv));

  if (!__DEV__) {
    return envUrl;
  }

  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  const metroHost = debuggerHost?.split(":")[0];

  if (metroHost === "localhost" || metroHost === "127.0.0.1") {
    return "http://localhost:3001";
  }

  if (Platform.OS === "android" && metroHost === "10.0.2.2") {
    return "http://10.0.2.2:3001";
  }

  return envUrl;
}

export const API_URL = resolveApiUrl();
export const API_BASE = `${API_URL}/api`;
