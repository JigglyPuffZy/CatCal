export type RootTabParam = "home" | "cats" | "scan" | "profile";

export const TAB_ROUTES = {
  home: "/(tabs)",
  cats: "/(tabs)/cats",
  scan: "/(tabs)/scan",
  profile: "/(tabs)/profile",
} as const;
