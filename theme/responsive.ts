import { useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "./spacing";

export const TOUCH_TARGET = 44;

/** Width-only updates — ignores keyboard shrinking window height. */
function useStableWindowWidth() {
  const [width, setWidth] = useState(() => Dimensions.get("window").width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWidth((current) =>
        current !== window.width ? window.width : current
      );
    });
    return () => subscription.remove();
  }, []);

  return width;
}

export function useResponsiveLayout() {
  const width = useStableWindowWidth();
  const insets = useSafeAreaInsets();
  const height = Dimensions.get("screen").height;

  return useMemo(() => {
    const isCompact = width < 360;
    const isTablet = width >= 768;

    const horizontalPadding = isTablet
      ? spacing.lg
      : isCompact
        ? spacing.xs
        : spacing.sm;

    const sectionGap = isCompact ? spacing.xs : spacing.sm;
    const contentMaxWidth = isTablet ? 520 : undefined;
    const gridGap = spacing.xs;
    const quickActionWidth =
      (Math.min(width, contentMaxWidth ?? width) -
        horizontalPadding * 2 -
        gridGap) /
      2;

    return {
      width,
      height,
      insets,
      isCompact,
      isTablet,
      horizontalPadding,
      sectionGap,
      contentMaxWidth,
      gridGap,
      quickActionWidth,
      scrollBottomPadding: 96 + insets.bottom,
      tabBarHeight: 56 + insets.bottom,
    };
  }, [width, insets]);
}

const PH_TIMEZONE = "Asia/Manila";

function getHourInTimezone(timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    hour12: false,
    timeZone,
  }).format(new Date());
  return Number(hour) % 24;
}

export function getGreeting(name?: string): string {
  const hour = getHourInTimezone(PH_TIMEZONE);
  let base: string;
  if (hour < 12) base = "Good morning";
  else if (hour < 17) base = "Good afternoon";
  else base = "Good evening";

  const trimmed = name?.trim();
  if (trimmed) return `${base}, ${trimmed}`;
  return base;
}

export function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: PH_TIMEZONE,
  });
}
