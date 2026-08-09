import { forwardRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors } from "../theme";

type AuthInputProps = TextInputProps & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
  style?: ViewStyle;
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  function AuthInput(
    {
      label,
      icon: Icon,
      error,
      containerClassName = "",
      style,
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);
    const isPassword = secureTextEntry === true;

    const borderColor = error
      ? "#F87171"
      : focused
        ? colors.primary
        : colors.border;

    return (
      <View className={`w-full ${containerClassName}`}>
        <Text className="mb-2 text-caption font-semibold text-text">
          {label}
        </Text>
        <View
          className="h-14 flex-row items-center rounded-2xl bg-card px-4"
          style={{
            borderWidth: 1,
            borderColor,
          }}
        >
          {Icon ? (
            <Icon
              size={20}
              color={focused ? colors.primary : colors.secondaryText}
              strokeWidth={2}
            />
          ) : null}
          <TextInput
            ref={ref}
            {...props}
            placeholderTextColor={colors.secondaryText}
            style={[
              {
                flex: 1,
                fontSize: 16,
                color: colors.text,
                marginLeft: Icon ? 12 : 0,
                paddingRight: isPassword ? 8 : 0,
                paddingVertical: 0,
              },
              style,
            ]}
            secureTextEntry={isPassword ? hidden : false}
            blurOnSubmit={false}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
          {isPassword ? (
            <Pressable
              onPress={() => setHidden((value) => !value)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={hidden ? "Show password" : "Hide password"}
              className="h-10 w-10 items-center justify-center rounded-xl active:bg-background"
            >
              {hidden ? (
                <Eye size={20} color={colors.secondaryText} />
              ) : (
                <EyeOff size={20} color={colors.secondaryText} />
              )}
            </Pressable>
          ) : null}
        </View>
        {error ? (
          <Text className="mt-2 text-caption text-red-500">{error}</Text>
        ) : null}
      </View>
    );
  }
);

AuthInput.displayName = "AuthInput";
