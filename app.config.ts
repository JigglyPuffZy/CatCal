import type { ConfigContext, ExpoConfig } from "expo/config";

const PRODUCTION_API_URL = "https://catcal.onrender.com";

function normalizeApiUrl(url: string | undefined): string | undefined {
  return url?.trim().replace(/\/$/, "");
}

function resolveApiUrl(): string | undefined {
  const fromEnv = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  if (fromEnv) {
    return fromEnv;
  }

  const buildProfile = process.env.EAS_BUILD_PROFILE;
  if (buildProfile === "preview" || buildProfile === "production") {
    return PRODUCTION_API_URL;
  }

  return undefined;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = resolveApiUrl();
  const buildProfile = process.env.EAS_BUILD_PROFILE;
  const isReleaseBuild =
    buildProfile === "preview" || buildProfile === "production";

  if (isReleaseBuild) {
    if (!apiUrl || apiUrl.includes("YOUR-DEPLOYED-API")) {
      throw new Error(
        "Set EXPO_PUBLIC_API_URL to your live backend URL before building the APK. See DEPLOY.md."
      );
    }
    if (!apiUrl.startsWith("https://")) {
      throw new Error(
        "Release builds require HTTPS for EXPO_PUBLIC_API_URL (use your deployed API URL)."
      );
    }
  }

  return {
    ...config,
    name: config.name ?? "CatCal",
    slug: config.slug ?? "catcal",
    version: config.version ?? "1.0.0",
    android: {
      ...config.android,
      versionCode: config.android?.versionCode ?? 1,
    },
    extra: {
      ...config.extra,
      apiUrl,
    },
  };
};
