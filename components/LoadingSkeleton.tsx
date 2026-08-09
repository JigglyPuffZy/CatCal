import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

type LoadingSkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
};

export function LoadingSkeleton({
  width = "100%",
  height = 16,
  borderRadius = 12,
  className = "",
  style,
}: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, opacity }, style]}
      className={`bg-border ${className}`}
    />
  );
}

type SkeletonGroupProps = {
  className?: string;
  style?: ViewStyle;
};

export function CardSkeleton({ className = "", style }: SkeletonGroupProps) {
  return (
    <View
      style={style}
      className={`rounded-3xl bg-card p-6 ${className}`}
    >
      <LoadingSkeleton width="40%" height={12} />
      <View className="mt-4">
        <LoadingSkeleton width="70%" height={28} />
      </View>
      <View className="mt-4">
        <LoadingSkeleton width="100%" height={12} />
      </View>
    </View>
  );
}
