import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pencil, Trash2 } from "lucide-react-native";
import {
  CatProfileForm,
  catToFormData,
  FlowSteps,
  GlassCard,
  LoadingOverlay,
  NavigationBar,
  SecondaryButton,
} from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
import { ApiError } from "../lib/api/client";
import { getRouteParam } from "../lib/routeParams";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

import { REGISTRATION_STEPS } from "../constants/registrationFlow";

export function EditCatScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getRouteParam(params.id);
  const router = useRouter();
  const { colors } = useTheme();
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();
  const { getCat, updateCat, deleteCat } = useCatFeeding();
  const cat = id ? getCat(id) : undefined;
  const [deleting, setDeleting] = useState(false);

  if (!cat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text className="p-4 text-body" style={{ color: colors.text }}>
          Cat not found.
        </Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      `Delete ${cat.name}?`,
      "This removes the cat profile, feeding history, and weight records. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            void deleteCat(cat.id)
              .then(() => {
                router.replace("/(tabs)/cats");
              })
              .catch((error) => {
                const message =
                  error instanceof ApiError
                    ? error.message
                    : error instanceof Error
                      ? error.message
                      : "Could not delete this cat.";
                Alert.alert("Delete failed", message);
              })
              .finally(() => {
                setDeleting(false);
              });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <LoadingOverlay visible={deleting} message="Deleting profile…" />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: colors.orbPrimary,
        }}
      />

      <View
        style={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <NavigationBar title="Edit Cat" onBack={() => router.back()} />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
          paddingBottom: 40,
        }}
      >
        <GlassCard padding="md" className="mb-4">
          <View className="flex-row items-center">
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Pencil size={22} color={colors.primary} strokeWidth={2} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-title font-bold" style={{ color: colors.text }}>
                Update {cat.name}
              </Text>
              <Text className="mt-0.5 text-caption" style={{ color: colors.secondaryText }}>
                Calorie plan refreshes after you save
              </Text>
            </View>
          </View>
        </GlassCard>

        <FlowSteps steps={REGISTRATION_STEPS} currentStep={1} />

        <CatProfileForm
          initial={catToFormData(cat)}
          submitLabel="Save changes"
          variant="edit"
          scrollable={false}
          onSubmit={async (form) => {
            await updateCat(cat.id, form);
            router.replace(`/cat/${cat.id}/plan`);
          }}
        />

        <View className="mt-8 border-t border-border/60 pt-6">
          <Text className="mb-2 text-body font-semibold" style={{ color: colors.text }}>
            Danger zone
          </Text>
          <Text className="mb-4 text-caption leading-5" style={{ color: colors.secondaryText }}>
            Permanently remove {cat.name}&apos;s profile and all feeding data.
          </Text>
          <SecondaryButton
            label="Delete cat profile"
            loading={deleting}
            loadingLabel="Deleting…"
            disabled={deleting}
            onPress={handleDelete}
            style={{ borderColor: "rgba(220, 38, 38, 0.35)" }}
          />
          <View className="mt-3 flex-row items-center justify-center">
            <Trash2 size={14} color="#DC2626" />
            <Text className="ml-1 text-caption" style={{ color: "#DC2626" }}>
              Cannot be undone
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
