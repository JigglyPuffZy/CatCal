import { useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Download, Printer, QrCode, Share2 } from "lucide-react-native";
import {
  FlowSteps,
  GlassCard,
  NavigationBar,
  PrimaryButton,
  QRCodeCard,
  SecondaryButton,
} from "../components";
import { REGISTRATION_STEPS } from "../constants/registrationFlow";
import { useCatFeeding } from "../context/CatFeedingContext";
import { captureQrBase64, saveQrToPhotos, shareQrCode } from "../lib/exportQr";
import { getRouteParam } from "../lib/routeParams";
import { useResponsiveLayout } from "../theme";
import { useTheme } from "../theme/ThemeProvider";

type QrSvgRef = { toDataURL: (callback: (data: string) => void) => void };

export function CatQRScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = getRouteParam(params.id);
  const router = useRouter();
  const { colors } = useTheme();
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();
  const { getCat } = useCatFeeding();
  const cat = id ? getCat(id) : undefined;
  const qrRef = useRef<QrSvgRef | null>(null);
  const [busy, setBusy] = useState<"share" | "save" | null>(null);

  if (!cat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ padding: 16, color: colors.text }}>Cat not found.</Text>
      </SafeAreaView>
    );
  }

  const exportQr = async (action: "share" | "save") => {
    if (!qrRef.current) {
      Alert.alert("QR not ready", "Please wait a moment and try again.");
      return;
    }
    setBusy(action);
    try {
      const base64 = await captureQrBase64(qrRef.current);
      if (action === "share") {
        await shareQrCode(base64, cat.name);
      } else {
        await saveQrToPhotos(base64, cat.name);
      }
    } catch {
      Alert.alert("Export failed", "Could not export the QR code. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -50,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: 100,
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
        <NavigationBar title="QR Code" onBack={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
          width: "100%",
          alignSelf: "center",
          paddingBottom: 40,
        }}
      >
        <FlowSteps steps={REGISTRATION_STEPS} currentStep={2} />

        <GlassCard padding="md" className="mb-5">
          <View className="flex-row items-center">
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <QrCode size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View className="min-w-0 flex-1">
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>
                Unique QR for {cat.name}
              </Text>
              <Text style={{ marginTop: 2, color: colors.secondaryText, fontSize: 13 }}>
                Auto-generated at registration
              </Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard padding="lg" className="mb-4">
          <QRCodeCard
            value={cat.qrCode}
            subtitle="Scan with CatCal to open this cat's profile instantly"
            size={200}
            className="bg-transparent shadow-none"
            title=""
            onQrRef={(ref) => {
              qrRef.current = ref;
            }}
          />
        </GlassCard>

        <GlassCard padding="md" className="mb-5">
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600", marginBottom: 8 }}>
            Collar tag (optional)
          </Text>
          <Text style={{ color: colors.secondaryText, fontSize: 14, lineHeight: 21 }}>
            Download or print this QR code and attach it to {cat.name}&apos;s collar.
            When you scan it with the app, their full profile opens right away.
          </Text>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <SecondaryButton
                label={busy === "save" ? "Saving…" : "Save image"}
                onPress={() => exportQr("save")}
                disabled={busy !== null}
              />
            </View>
            <View className="flex-1">
              <SecondaryButton
                label={busy === "share" ? "Sharing…" : "Share / print"}
                onPress={() => exportQr("share")}
                disabled={busy !== null}
              />
            </View>
          </View>
          {busy ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
          ) : (
            <View className="mt-3 flex-row items-center justify-center gap-4">
              <Download size={14} color={colors.secondaryText} />
              <Printer size={14} color={colors.secondaryText} />
              <Share2 size={14} color={colors.secondaryText} />
            </View>
          )}
        </GlassCard>

        <PrimaryButton
          label="Continue to calorie plan"
          onPress={() => router.replace(`/cat/${cat.id}/plan`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
