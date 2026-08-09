import { ReactNode } from "react";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressableScale({
  children,
  className = "",
  style,
  scaleTo = 0.98,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={[animatedStyle, style]}
      className={className}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, { damping: 20, stiffness: 300 });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: ViewStyle;
};

export function FadeInView({
  children,
  delay = 0,
  className = "",
  style,
}: FadeInProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420).springify().damping(18)}
      className={className}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
