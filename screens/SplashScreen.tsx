import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, ScanLine, Utensils } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { AuthBackground, BookOpenMark } from "../components";
import { APP_NAME } from "../constants";
import { colors, shadows } from "../theme";

const SPLASH_DURATION_MS = 3200;
const LOGO_SIZE = 120;
const LOGO_RING_SIZE = LOGO_SIZE + 48;

const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Flame, label: "Calories" },
  { icon: Utensils, label: "Feeding" },
  { icon: ScanLine, label: "QR Scan" },
];

function LoadingDots() {
  const dot1 = useSharedValue(0.35);
  const dot2 = useSharedValue(0.35);
  const dot3 = useSharedValue(0.35);

  useEffect(() => {
    const pulse = (delay: number) =>
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 380 }),
            withTiming(0.35, { duration: 380 })
          ),
          -1,
          false
        )
      );

    dot1.value = pulse(0);
    dot2.value = pulse(140);
    dot3.value = pulse(280);
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [
      { scale: interpolate(dot1.value, [0.35, 1], [0.85, 1.15]) },
    ],
  }));
  const style2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [
      { scale: interpolate(dot2.value, [0.35, 1], [0.85, 1.15]) },
    ],
  }));
  const style3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [
      { scale: interpolate(dot3.value, [0.35, 1], [0.85, 1.15]) },
    ],
  }));

  const dotBase = {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  };

  return (
    <View className="flex-row items-center gap-2">
      <Animated.View style={[style1, dotBase]} />
      <Animated.View style={[style2, dotBase]} />
      <Animated.View style={[style3, dotBase]} />
    </View>
  );
}

function FloatingShape({
  size,
  top,
  left,
  color,
  opacity,
  duration,
}: {
  size: number;
  top: number;
  left: number;
  color: string;
  opacity: number;
  duration: number;
}) {
  const drift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration * 0.6 }),
        withTiming(0, { duration: duration * 0.6 })
      ),
      -1,
      false
    );
  }, [breathe, drift, duration]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity + breathe.value * 0.06,
    transform: [
      { translateY: interpolate(drift.value, [0, 1], [0, -20]) },
      { translateX: interpolate(drift.value, [0, 1], [0, 12]) },
      { scale: 1 + breathe.value * 0.06 },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

function RippleRing({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 1], [0, 0.28, 0]),
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.9, 1.45]),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: "absolute",
          width: LOGO_RING_SIZE,
          height: LOGO_RING_SIZE,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: colors.primary,
        },
      ]}
    />
  );
}

function FeaturePill({
  icon: Icon,
  label,
  opacity,
  translateY,
}: {
  icon: LucideIcon;
  label: string;
  opacity: SharedValue<number>;
  translateY: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[style, shadows.soft]}
      className="flex-row items-center rounded-full border border-border/70 bg-card/95 px-4 py-2.5"
    >
      <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-accent/25">
        <Icon size={14} color={colors.primary} strokeWidth={2.2} />
      </View>
      <Text className="text-caption font-semibold text-text">{label}</Text>
    </Animated.View>
  );
}

function ProgressPercent({ progress }: { progress: SharedValue<number> }) {
  const [percent, setPercent] = useState(0);

  useAnimatedReaction(
    () => Math.round(progress.value * 100),
    (value, prev) => {
      if (value !== prev) {
        runOnJS(setPercent)(value);
      }
    }
  );

  return (
    <Text className="text-caption font-semibold text-primary">{percent}%</Text>
  );
}

export function SplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [ready, setReady] = useState(false);

  const contentOpacity = useSharedValue(0);
  const logoY = useSharedValue(12);
  const glowPulse = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(14);
  const accentWidth = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const chipsOpacity = useSharedValue(0);
  const chip1Y = useSharedValue(12);
  const chip2Y = useSharedValue(12);
  const chip3Y = useSharedValue(12);
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    async function bootstrap() {
      try {
        await ExpoSplashScreen.hideAsync();
      } finally {
        setReady(true);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!ready) return;

    contentOpacity.value = withTiming(1, { duration: 350 });
    logoY.value = withTiming(0, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    titleOpacity.value = withDelay(
      1250,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    titleY.value = withDelay(
      1250,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    accentWidth.value = withDelay(
      1450,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    subtitleOpacity.value = withDelay(
      1550,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    chipsOpacity.value = withDelay(
      1750,
      withTiming(1, { duration: 450 })
    );
    chip1Y.value = withDelay(
      1750,
      withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    chip2Y.value = withDelay(
      1850,
      withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    chip3Y.value = withDelay(
      1950,
      withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) })
    );
    footerOpacity.value = withDelay(1800, withTiming(1, { duration: 400 }));
    progress.value = withDelay(
      900,
      withTiming(1, {
        duration: SPLASH_DURATION_MS - 900,
        easing: Easing.inOut(Easing.quad),
      })
    );
    shimmer.value = withDelay(
      1100,
      withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        -1,
        false
      )
    );

    const timer = setTimeout(() => router.replace("/login"), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [
    accentWidth,
    chip1Y,
    chip2Y,
    chip3Y,
    chipsOpacity,
    contentOpacity,
    footerOpacity,
    glowPulse,
    logoY,
    progress,
    ready,
    router,
    shimmer,
    subtitleOpacity,
    titleOpacity,
    titleY,
  ]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const logoWrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value * 0.32,
    transform: [{ scale: 0.92 + glowPulse.value * 0.18 }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const accentLineStyle = useAnimatedStyle(() => ({
    width: `${accentWidth.value * 56}%`,
    opacity: accentWidth.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const chipsWrapStyle = useAnimatedStyle(() => ({
    opacity: chipsOpacity.value,
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-80, width * 0.5]) },
    ],
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.55, 0]),
  }));

  const progressLabelStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  if (!ready) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <AuthBackground>
      <FloatingShape
        size={130}
        top={height * 0.06}
        left={-40}
        color={colors.accent}
        opacity={0.16}
        duration={5200}
      />
      <FloatingShape
        size={90}
        top={height * 0.22}
        left={width * 0.58}
        color={colors.primary}
        opacity={0.1}
        duration={6800}
      />
      <FloatingShape
        size={70}
        top={height * 0.72}
        left={width * 0.08}
        color={colors.accent}
        opacity={0.12}
        duration={7400}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={contentStyle} className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <Animated.View style={logoWrapStyle} className="items-center">
              <View className="mb-7 items-center justify-center">
                <RippleRing delay={900} />
                <RippleRing delay={1600} />
                <Animated.View
                  style={[
                    glowStyle,
                    {
                      position: "absolute",
                      width: LOGO_SIZE + 44,
                      height: LOGO_SIZE + 44,
                      borderRadius: 20,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
                <BookOpenMark size={LOGO_SIZE} />
              </View>

              <Animated.View style={titleStyle} className="items-center">
                <Text
                  className="text-center text-display font-bold text-text"
                  accessibilityRole="header"
                >
                  {APP_NAME}
                </Text>
                <Animated.View
                  style={[
                    accentLineStyle,
                    {
                      height: 4,
                      marginTop: 10,
                      borderRadius: 2,
                      backgroundColor: colors.primary,
                      maxWidth: 120,
                    },
                  ]}
                />
              </Animated.View>

              <Animated.View style={subtitleStyle}>
                <Text className="mt-4 max-w-[300px] text-center text-body leading-6 text-secondary">
                  Calorie & feeding guidance for your cats
                </Text>
              </Animated.View>

              <Animated.View
                style={chipsWrapStyle}
                className="mt-8 flex-row flex-wrap items-center justify-center gap-2"
              >
                <FeaturePill
                  icon={FEATURES[0].icon}
                  label={FEATURES[0].label}
                  opacity={chipsOpacity}
                  translateY={chip1Y}
                />
                <FeaturePill
                  icon={FEATURES[1].icon}
                  label={FEATURES[1].label}
                  opacity={chipsOpacity}
                  translateY={chip2Y}
                />
                <FeaturePill
                  icon={FEATURES[2].icon}
                  label={FEATURES[2].label}
                  opacity={chipsOpacity}
                  translateY={chip3Y}
                />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View style={footerStyle} className="px-8 pb-12">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <LoadingDots />
                <Text className="ml-3 text-caption text-secondary">
                  Loading app
                </Text>
              </View>
              <ProgressPercent progress={progress} />
            </View>

            <View className="relative h-2 overflow-hidden rounded-full bg-border/80">
              <Animated.View
                style={[
                  progressStyle,
                  {
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Animated.View
                style={[
                  shimmerStyle,
                  {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 60,
                    backgroundColor: "rgba(255,255,255,0.45)",
                    borderRadius: 999,
                  },
                ]}
              />
            </View>

            <Animated.View style={progressLabelStyle}>
              <Text className="mt-3 text-center text-caption text-secondary">
                Preparing your dashboard…
              </Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </AuthBackground>
  );
}
