import { Text, TextInput, View, TextInputProps, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  style?: ViewStyle;
};

export function Input({
  label,
  error,
  containerClassName = "",
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <Text
          className="mb-2 text-caption font-medium"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.secondaryText}
        style={[
          {
            height: 56,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: 16,
            fontSize: 16,
            color: colors.text,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text className="mt-2 text-caption" style={{ color: colors.danger }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
