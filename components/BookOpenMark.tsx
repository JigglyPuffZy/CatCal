import { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { AppMark } from "./AppMark";
import { colors, shadows } from "../theme";

type BookOpenMarkProps = {
  size?: number;
  onOpenComplete?: () => void;
  style?: ViewStyle;
};

/** Square card logo that opens like a book on launch. */
export function BookOpenMark({
  size = 120,
  onOpenComplete,
  style,
}: BookOpenMarkProps) {
  const openProgress = useSharedValue(0);
  const half = size / 2;

  useEffect(() => {
    openProgress.value = withDelay(
      350,
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished && onOpenComplete) {
          runOnJS(onOpenComplete)();
        }
      })
    );
  }, [onOpenComplete, openProgress]);

  const leftCoverStyle = useAnimatedStyle(() => {
    const angle = interpolate(openProgress.value, [0, 1], [0, -108]);
    const lift = interpolate(openProgress.value, [0, 0.5, 1], [0, -4, -8]);
    return {
      opacity: interpolate(openProgress.value, [0, 0.85, 1], [1, 0.6, 0]),
      transform: [
        { perspective: 1400 },
        { translateX: half / 2 },
        { translateY: lift },
        { rotateY: `${angle}deg` },
        { translateX: -half / 2 },
      ],
    };
  });

  const rightCoverStyle = useAnimatedStyle(() => {
    const angle = interpolate(openProgress.value, [0, 1], [0, 108]);
    const lift = interpolate(openProgress.value, [0, 0.5, 1], [0, -4, -8]);
    return {
      opacity: interpolate(openProgress.value, [0, 0.85, 1], [1, 0.6, 0]),
      transform: [
        { perspective: 1400 },
        { translateX: -half / 2 },
        { translateY: lift },
        { rotateY: `${angle}deg` },
        { translateX: half / 2 },
      ],
    };
  });

  const spineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(openProgress.value, [0, 0.2, 1], [0.5, 0.35, 0]),
  }));

  const innerRevealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(openProgress.value, [0.35, 0.75, 1], [0, 0.5, 1]),
    transform: [
      { scale: interpolate(openProgress.value, [0.4, 1], [0.92, 1]) },
    ],
  }));

  const coverFace = (
    <View
      style={[
        shadows.medium,
        {
          width: size,
          height: size,
          shadowColor: colors.primary,
          shadowOpacity: 0.28,
        },
      ]}
    >
      <AppMark boxSize={size} />
    </View>
  );

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      <Animated.View
        style={[
          innerRevealStyle,
          { position: "absolute", alignItems: "center", justifyContent: "center" },
        ]}
      >
        <AppMark boxSize={size * 0.88} />
      </Animated.View>

      <Animated.View
        style={[
          spineStyle,
          {
            position: "absolute",
            left: half - 1,
            top: 6,
            bottom: 6,
            width: 2,
            borderRadius: 1,
            backgroundColor: "rgba(255,255,255,0.45)",
            zIndex: 20,
          },
        ]}
      />

      <Animated.View
        style={[
          leftCoverStyle,
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: half,
            height: size,
            overflow: "hidden",
            zIndex: 10,
            backfaceVisibility: "hidden",
          },
        ]}
      >
        {coverFace}
      </Animated.View>

      <Animated.View
        style={[
          rightCoverStyle,
          {
            position: "absolute",
            left: half,
            top: 0,
            width: half,
            height: size,
            overflow: "hidden",
            zIndex: 10,
            backfaceVisibility: "hidden",
          },
        ]}
      >
        <View style={{ marginLeft: -half }}>{coverFace}</View>
      </Animated.View>
    </View>
  );
}
