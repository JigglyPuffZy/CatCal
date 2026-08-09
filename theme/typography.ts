import { TextStyle } from "react-native";

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
