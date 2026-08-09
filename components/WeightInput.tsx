import { Pressable, Text, TextInput, View, ViewStyle } from "react-native";
import { useFormFieldStyles } from "../theme/formFieldStyles";

type WeightInputProps = {
  label?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  unit?: "kg" | "lbs";
  onUnitChange?: (unit: "kg" | "lbs") => void;
  error?: string;
  className?: string;
  style?: ViewStyle;
};

export function WeightInput({
  label = "Weight",
  value,
  onChangeText,
  unit = "kg",
  onUnitChange,
  error,
  className = "",
  style,
}: WeightInputProps) {
  const { label: labelStyle, input, placeholderColor, colors } = useFormFieldStyles();

  return (
    <View className={`w-full ${className}`} style={style}>
      {label ? <Text style={labelStyle}>{label}</Text> : null}
      <View
        style={[
          input,
          {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            borderColor: error ? colors.danger : input.borderColor,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0.0"
          placeholderTextColor={placeholderColor}
          style={{
            flex: 1,
            paddingHorizontal: 12,
            fontSize: 16,
            color: colors.text,
          }}
        />
        <View
          className="flex-row rounded-xl p-1"
          style={{ backgroundColor: colors.border }}
        >
          {(["kg", "lbs"] as const).map((option) => {
            const active = unit === option;
            return (
              <Pressable
                key={option}
                onPress={() => onUnitChange?.(option)}
                className="rounded-lg px-3 py-2"
                style={{
                  backgroundColor: active ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: active ? colors.white : colors.secondaryText,
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {error ? (
        <Text style={{ marginTop: 8, fontSize: 13, color: colors.danger }}>{error}</Text>
      ) : null}
    </View>
  );
}
