import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View, ViewStyle } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { shadows } from "../theme";
import { useFormFieldStyles } from "../theme/formFieldStyles";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  style?: ViewStyle;
};

export function Dropdown({
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  className = "",
  style,
}: DropdownProps) {
  const { label: labelStyle, input, colors } = useFormFieldStyles();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className={`w-full ${className}`} style={style}>
      {label ? <Text style={labelStyle}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="active:opacity-80"
        style={[
          input,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            color: selected ? colors.text : colors.secondaryText,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={colors.secondaryText} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: colors.overlay }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              shadows.medium,
              {
                backgroundColor: colors.backgroundAlt,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
            className="max-h-[50%] px-6 pb-10 pt-4"
          >
            <View className="mb-4 items-center">
              <View
                className="h-1.5 w-12 rounded-full"
                style={{ backgroundColor: colors.border }}
              />
            </View>
            <Text
              style={{
                marginBottom: 16,
                fontSize: 20,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {label ?? "Select"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange?.(option.value);
                      setOpen(false);
                    }}
                    className="mb-2 flex-row items-center justify-between rounded-2xl px-4 py-4 active:opacity-80"
                    style={{
                      backgroundColor: isSelected ? `${colors.primary}14` : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? <Check size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
