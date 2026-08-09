import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pencil } from "lucide-react-native";
import {
  CatProfileForm,
  catToFormData,
  FlowSteps,
  GlassCard,
  NavigationBar,
} from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
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
  const { getCat, updateCat } = useCatFeeding();
  const cat = id ? getCat(id) : undefined;

  if (!cat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text className="p-4 text-body" style={{ color: colors.text }}>
          Cat not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
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
      </ScrollView>
    </SafeAreaView>
  );
}
