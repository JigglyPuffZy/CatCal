import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Camera, ImageIcon, QrCode, ScanLine, Utensils } from "lucide-react-native";
import { HowItWorksCard, LoadingOverlay, PrimaryButton, ScreenContainer, SecondaryButton } from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
import { pickAndScanQrFromGallery } from "../lib/scanQrFromImage";
import { useTheme } from "../theme/ThemeProvider";

const STEPS = [
  {
    icon: Camera,
    title: "Open scanner",
    description: "Tap the button — full-screen camera opens automatically.",
  },
  {
    icon: ImageIcon,
    title: "Or use a photo",
    description: "Scan a screenshot or saved QR from your gallery.",
  },
  {
    icon: QrCode,
    title: "Scan collar tag",
    description: "Each cat has a unique QR from registration.",
  },
  {
    icon: Utensils,
    title: "View & log meals",
    description: "Profile, calories, and one-tap meal logging.",
  },
] as const;

export function ScanScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { resolveCatFromQr, setActiveCatId } = useCatFeeding();
  const [permission, requestPermission] = useCameraPermissions();
  const [opening, setOpening] = useState(false);
  const [scanningPhoto, setScanningPhoto] = useState(false);

  const openCatFromQr = async (data: string) => {
    const cat = await resolveCatFromQr(data);
    if (!cat) {
      Alert.alert(
        "Not a CatCal tag",
        "This QR isn’t linked to a cat in your app. Register the cat first or try another tag."
      );
      return false;
    }
    setActiveCatId(cat.id);
    router.push(`/cat/${cat.id}`);
    return true;
  };

  const openScanner = async () => {
    setOpening(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            "Camera needed",
            "Turn on camera access in Settings to scan QR codes on your cat’s collar."
          );
          return;
        }
      }
      router.push("/scan-camera");
    } finally {
      setOpening(false);
    }
  };

  const scanFromGallery = async () => {
    setScanningPhoto(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const data = await pickAndScanQrFromGallery();
      if (data) {
        await openCatFromQr(data);
      }
    } finally {
      setScanningPhoto(false);
    }
  };

  return (
    <ScreenContainer showBackground={false}>
      <LoadingOverlay
        visible={opening || scanningPhoto}
        message={scanningPhoto ? "Reading QR from photo…" : "Opening camera…"}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Scan QR</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Open a cat profile from their collar tag.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${colors.primary}18` },
            ]}
          >
            <ScanLine size={36} color={colors.primary} strokeWidth={2} />
          </View>

          <Text style={[styles.cardText, { color: colors.secondaryText }]}>
            Each cat gets a QR code when you register them. Stick it on their collar
            and scan it here.
          </Text>

          <PrimaryButton
            label="Open camera"
            loadingLabel="Opening…"
            loading={opening}
            disabled={opening || scanningPhoto}
            onPress={openScanner}
          />

          <SecondaryButton
            label="Scan from gallery"
            loadingLabel="Scanning…"
            loading={scanningPhoto}
            disabled={opening || scanningPhoto}
            onPress={scanFromGallery}
            className="mt-3"
          />
        </View>

        <HowItWorksCard title="How it works" steps={[...STEPS]} style={{ marginTop: 24 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 24,
  },
});
