import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PawPrint } from "lucide-react-native";
import {
  CatProfileForm,
  emptyCatForm,
  FlowSteps,
  GlassCard,
  NavigationBar,
} from "../components";
import { REGISTRATION_STEPS } from "../constants/registrationFlow";
import { useCatFeeding } from "../context/CatFeedingContext";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

export function AddCatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addCat } = useCatFeeding();
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();

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
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 160,
          left: -70,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: colors.orbAccent,
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
        <NavigationBar title="Register Cat" onBack={() => router.back()} />
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
        <GlassCard padding="md" className="mb-5">
          <View className="flex-row items-center">
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <PawPrint size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View className="min-w-0 flex-1">
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                Add your cat
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  color: colors.secondaryText,
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                Add your cat in 4 quick steps — we&apos;ll handle the QR code and meal
                plan for you.
              </Text>
            </View>
          </View>
        </GlassCard>

        <FlowSteps steps={REGISTRATION_STEPS} currentStep={1} />

        <CatProfileForm
          initial={emptyCatForm()}
          submitLabel="Save & generate QR code"
          variant="register"
          scrollable={false}
          onSubmit={async (form) => {
            const cat = await addCat(form);
            router.replace(`/cat/${cat.id}/qr`);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
