import { useState } from "react";
import { Platform, Pressable, Text, View, ViewStyle } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useFormFieldStyles } from "../theme/formFieldStyles";

type DatePickerProps = {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  className?: string;
  style?: ViewStyle;
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DatePicker({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  className = "",
  style,
}: DatePickerProps) {
  const { label: labelStyle, input, colors } = useFormFieldStyles();
  const [open, setOpen] = useState(false);
  const selected = value ?? new Date();

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (date) {
      onChange?.(date);
    }
  };

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
        <Text style={{ color: colors.text, fontSize: 16 }}>{formatDate(selected)}</Text>
        <Calendar size={18} color={colors.secondaryText} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
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
