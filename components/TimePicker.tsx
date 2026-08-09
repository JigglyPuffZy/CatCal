import { useState } from "react";
import { Platform, Pressable, Text, View, ViewStyle } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Clock3 } from "lucide-react-native";
import {
  dateToMealTime,
  formatMealTime,
  mealTimeToDate,
} from "../lib/feedingSchedule";
import { useFormFieldStyles } from "../theme/formFieldStyles";
import { useTheme } from "../theme/ThemeProvider";

type TimePickerProps = {
  label?: string;
  value: string;
  onChange: (time: string) => void;
  className?: string;
  style?: ViewStyle;
};

export function TimePicker({
  label,
  value,
  onChange,
  className = "",
  style,
}: TimePickerProps) {
  const { label: labelStyle, input, colors } = useFormFieldStyles();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = mealTimeToDate(value);

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (date) {
      onChange(dateToMealTime(date));
    }
  };

  return (
    <View className={`w-full ${className}`} style={style}>
      {label ? <Text style={labelStyle}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? "Meal time"} ${formatMealTime(value)}`}
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
        <Text style={{ color: colors.text, fontSize: 16 }}>{formatMealTime(value)}</Text>
        <Clock3 size={18} color={colors.secondaryText} />
      </Pressable>
      {open ? (
        <View
          style={{
            marginTop: 8,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <DateTimePicker
            value={selected}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            themeVariant={isDark ? "dark" : "light"}
            textColor={colors.text}
            accentColor={colors.primary}
          />
        </View>
      ) : null}
      {Platform.OS === "ios" && open ? (
        <Pressable onPress={() => setOpen(false)} className="mt-2 items-end">
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
            Done
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
