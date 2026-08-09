import { ReactNode, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import {
  Camera,
  Cat,
  HeartPulse,
  QrCode,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";
import { DatePicker } from "./DatePicker";
import { Dropdown } from "./Dropdown";
import { GlassCard } from "./GlassCard";
import { LoadingOverlay } from "./LoadingOverlay";
import { PrimaryButton } from "./PrimaryButton";
import { WeightInput } from "./WeightInput";
import { showCatPhotoSourcePicker } from "../lib/pickCatPhoto";
import {
  ACTIVITY_LEVELS,
  HEALTH_CONDITIONS,
  SEX_OPTIONS,
} from "../constants";
import { getFoodBrand } from "../constants/foodBrands";
import { useCatFeeding } from "../context/CatFeedingContext";
import type { CatFormData } from "../types/cat";
import { useTheme } from "../theme/ThemeProvider";
import { useFormFieldStyles } from "../theme/formFieldStyles";

type CatProfileFormProps = {
  initial: CatFormData;
  onSubmit: (data: CatFormData) => void | Promise<void>;
  submitLabel: string;
  variant?: "register" | "edit";
  /** When false, render as a View — parent ScrollView handles scrolling */
  scrollable?: boolean;
};

function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <GlassCard padding="md" className="mb-4">
      <View className="mb-5 flex-row items-center">
        <View
          className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.primary}18` }}
        >
          <Icon size={20} color={colors.primary} strokeWidth={2.2} />
        </View>
        <View className="min-w-0 flex-1">
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                marginTop: 2,
                color: colors.secondaryText,
                fontSize: 13,
                lineHeight: 18,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </GlassCard>
  );
}

function ThemedInput({
  label,
  hint,
  containerClassName = "",
  ...props
}: TextInputProps & {
  label: string;
  hint?: string;
  containerClassName?: string;
}) {
  const { label: labelStyle, hint: hintStyle, input, placeholderColor, colors } =
    useFormFieldStyles();
  const [focused, setFocused] = useState(false);

  return (
    <View className={`w-full ${containerClassName}`}>
      <Text style={labelStyle}>{label}</Text>
      {hint ? <Text style={hintStyle}>{hint}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor={placeholderColor}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          input,
          {
            borderColor: focused ? colors.primary : input.borderColor,
          },
          props.style,
        ]}
      />
    </View>
  );
}

function ChipGroup({
  label,
  hint,
  options,
  value,
  onChange,
  stacked = false,
}: {
  label: string;
  hint?: string;
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  stacked?: boolean;
}) {
  const { label: labelStyle, hint: hintStyle, colors } = useFormFieldStyles();
  const useStack =
    stacked || options.some((option) => option.label.length > 12);

  return (
    <View className="w-full">
      <Text style={labelStyle}>{label}</Text>
      {hint ? <Text style={{ ...hintStyle, marginBottom: 12 }}>{hint}</Text> : null}
      <View className={useStack ? "gap-2" : "flex-row flex-wrap gap-2"}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className="rounded-2xl px-4 py-3 active:opacity-85"
              style={{
                backgroundColor: selected ? `${colors.primary}22` : colors.glass,
                borderWidth: 1.5,
                borderColor: selected ? colors.primary : colors.border,
                width: useStack ? "100%" : undefined,
                minWidth: !useStack && option.label.length > 10 ? "47%" : undefined,
                flexGrow: !useStack && option.label.length > 10 ? 1 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  textAlign: useStack ? "left" : "center",
                  color: selected ? colors.primary : colors.text,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CatProfileForm({
  initial,
  onSubmit,
  submitLabel,
  variant = "register",
  scrollable = true,
}: CatProfileFormProps) {
  const { colors } = useTheme();
  const { foodBrands } = useCatFeeding();
  const { progressTrack } = useFormFieldStyles();
  const [form, setForm] = useState<CatFormData>(initial);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof CatFormData>(key: K, value: CatFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openPhotoPicker = () => {
    showCatPhotoSourcePicker((uri) => update("photoUri", uri));
  };

  const canSubmit =
    form.name.trim().length > 0 &&
    form.sex &&
    form.activityLevel &&
    form.healthCondition &&
    form.foodBrandValue &&
    parseFloat(form.weightKg) > 0;

  const completion = useMemo(() => {
    let filled = 0;
    const total = 7;
    if (form.name.trim()) filled += 1;
    if (form.weightKg && parseFloat(form.weightKg) > 0) filled += 1;
    if (form.sex) filled += 1;
    if (form.activityLevel) filled += 1;
    if (form.healthCondition) filled += 1;
    if (form.foodBrandValue) filled += 1;
    if (form.photoUri) filled += 1;
    return { filled, total, ratio: filled / total };
  }, [form]);

  const selectedBrand = form.foodBrandValue
    ? getFoodBrand(form.foodBrandValue, foodBrands)
    : undefined;

  const formContent = (
    <>
      {/* Photo hero */}
      <GlassCard padding="lg" className="mb-4" contentClassName="items-center">
        <Pressable
          onPress={openPhotoPicker}
          accessibilityRole="button"
          accessibilityLabel="Add cat photo"
          className="items-center active:opacity-90"
        >
          <View className="mb-1 items-center justify-center pb-2">
            <View
              className="absolute h-[132px] w-[132px] rounded-full"
              style={{ backgroundColor: `${colors.primary}18` }}
            />
            <View
              className="h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border-[3px]"
              style={{ borderColor: colors.primary, backgroundColor: colors.glass }}
            >
              {form.photoUri ? (
                <Image
                  source={{ uri: form.photoUri }}
                  className="h-full w-full"
                />
              ) : (
                <Cat size={44} color={colors.primary} strokeWidth={1.6} />
              )}
            </View>
            <View
              className="absolute -bottom-1 -right-1 h-10 w-10 items-center justify-center rounded-full border-2"
              style={{
                borderColor: colors.background,
                backgroundColor: colors.primary,
              }}
            >
              <Camera size={18} color={colors.white} strokeWidth={2.2} />
            </View>
          </View>
          <Text
            style={{
              marginTop: 16,
              color: colors.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {form.photoUri ? "Change photo" : "Add a photo"}
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: colors.secondaryText,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Optional — helps you spot your cat quickly
          </Text>
        </Pressable>

        <View className="mt-6 w-full">
          <View className="mb-2 flex-row items-center justify-between">
            <Text style={{ color: colors.secondaryText, fontSize: 13, fontWeight: "500" }}>
              Profile completion
            </Text>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
              {completion.filled}/{completion.total}
            </Text>
          </View>
          <View
            className="h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: progressTrack }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${completion.ratio * 100}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </View>
      </GlassCard>

      <FormSection
        icon={Sparkles}
        title="Basics"
        subtitle="Name, age, weight & sex"
      >
        <ThemedInput
          label="Cat name"
          hint="What do you call your cat?"
          placeholder="e.g. Mochi, Luna, Simba"
          value={form.name}
          onChangeText={(value) => update("name", value)}
          autoCapitalize="words"
          containerClassName="mb-4"
        />

        <DatePicker
          label="Birth date"
          value={form.birthDate}
          onChange={(date) => update("birthDate", date)}
          maximumDate={new Date()}
          className="mb-4"
        />

        <WeightInput
          label="Current weight"
          value={form.weightKg}
          onChangeText={(value) => update("weightKg", value)}
          unit={form.weightUnit}
          onUnitChange={(unit) => update("weightUnit", unit)}
          className="mb-4"
        />

        <ChipGroup
          label="Sex"
          options={SEX_OPTIONS}
          value={form.sex}
          onChange={(value) => update("sex", value)}
        />
      </FormSection>

      <FormSection
        icon={HeartPulse}
        title="Health & activity"
        subtitle="Used for the calorie formula"
      >
        <View className="mb-4">
          <ChipGroup
            label="Activity level"
            hint="How much does your cat move day to day?"
            options={ACTIVITY_LEVELS}
            value={form.activityLevel}
            onChange={(value) => update("activityLevel", value)}
            stacked
          />
        </View>

        <Dropdown
          label="Health condition"
          placeholder="Select the best match"
          options={[...HEALTH_CONDITIONS]}
          value={form.healthCondition}
          onChange={(value) => update("healthCondition", value)}
        />
      </FormSection>

      <FormSection
        icon={UtensilsCrossed}
        title="Food brand"
        subtitle="We convert calories into grams for this food"
      >
        <Dropdown
          label="Preferred food"
          placeholder="Choose your cat's food"
          options={foodBrands.map((b) => ({ label: b.label, value: b.value }))}
          value={form.foodBrandValue}
          onChange={(value) => update("foodBrandValue", value)}
        />
        {selectedBrand ? (
          <View
            className="mt-4 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: `${colors.primary}12`,
              borderWidth: 1,
              borderColor: `${colors.primary}30`,
            }}
          >
            <Text style={{ color: colors.secondaryText, fontSize: 13, fontWeight: "500" }}>
              Energy density
            </Text>
            <Text
              style={{
                marginTop: 2,
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {selectedBrand.kcalPer100g} kcal per 100g
            </Text>
          </View>
        ) : null}
      </FormSection>

      {variant === "register" ? (
        <GlassCard padding="md" className="mb-5">
          <View className="flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${colors.primary}18` }}
            >
              <QrCode size={18} color={colors.primary} />
            </View>
            <Text
              style={{
                flex: 1,
                color: colors.secondaryText,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              Next step: we&apos;ll auto-generate a unique QR code, then calculate
              daily calories and portion sizes.
            </Text>
          </View>
        </GlassCard>
      ) : null}

      <PrimaryButton
        label={submitLabel}
        loading={submitting}
        loadingLabel="Saving…"
        disabled={!canSubmit || submitting}
        onPress={async () => {
          if (!canSubmit || submitting) return;
          setSubmitting(true);
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          try {
            await onSubmit(form);
          } finally {
            setSubmitting(false);
          }
        }}
      />

      {!canSubmit ? (
        <Text
          style={{
            marginTop: 12,
            textAlign: "center",
            color: colors.secondaryText,
            fontSize: 13,
          }}
        >
          Fill in name, weight, sex, activity, health & food to continue
        </Text>
      ) : null}
    </>
  );

  if (!scrollable) {
    return (
      <>
        <LoadingOverlay
          visible={submitting}
          message="Saving your cat…"
          hint="Creating QR code and daily meal plan."
        />
        <View>{formContent}</View>
      </>
    );
  }

  return (
    <>
      <LoadingOverlay
        visible={submitting}
        message="Saving your cat…"
        hint="Creating QR code and daily meal plan."
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {formContent}
      </ScrollView>
    </>
  );
}

export function catToFormData(cat: {
  name: string;
  photoUri?: string;
  birthDate: string;
  weightKg: number;
  sex: string;
  activityLevel: string;
  healthCondition: string;
  foodBrandValue: string;
}): CatFormData {
  return {
    name: cat.name,
    photoUri: cat.photoUri,
    birthDate: new Date(cat.birthDate),
    weightKg: String(cat.weightKg),
    weightUnit: "kg",
    sex: cat.sex,
    activityLevel: cat.activityLevel,
    healthCondition: cat.healthCondition,
    foodBrandValue: cat.foodBrandValue,
  };
}

export function emptyCatForm(): CatFormData {
  return {
    name: "",
    birthDate: new Date(2022, 0, 1),
    weightKg: "",
    weightUnit: "kg",
    sex: "",
    activityLevel: "",
    healthCondition: "",
    foodBrandValue: "",
  };
}
