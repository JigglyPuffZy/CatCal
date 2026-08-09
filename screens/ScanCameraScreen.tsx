import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { ChevronLeft, ScanLine } from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useCatFeeding } from "../context/CatFeedingContext";
import { useTheme } from "../theme/ThemeProvider";

const CORNER = 28;
const STROKE = 3;

function goBack(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)/scan");
  }
}

function Viewfinder({ size, color }: { size: number; color: string }) {
  const corners = useMemo(
    () =>
      ({
        tl: { top: 0, left: 0, borderTopWidth: STROKE, borderLeftWidth: STROKE, borderTopLeftRadius: 12 },
        tr: { top: 0, right: 0, borderTopWidth: STROKE, borderRightWidth: STROKE, borderTopRightRadius: 12 },
        bl: { bottom: 0, left: 0, borderBottomWidth: STROKE, borderLeftWidth: STROKE, borderBottomLeftRadius: 12 },
        br: { bottom: 0, right: 0, borderBottomWidth: STROKE, borderRightWidth: STROKE, borderBottomRightRadius: 12 },
      }) as const,
    []
  );

  return (
    <View style={{ width: size, height: size }}>
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <View
          key={pos}
          style={[
            styles.corner,
            corners[pos],
            { width: CORNER, height: CORNER, borderColor: color },
          ]}
        />
      ))}
    </View>
  );
}

export function ScanCameraScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { resolveCatFromQr, setActiveCatId } = useCatFeeding();
  const [permission, requestPermission] = useCameraPermissions();
  const [opening, setOpening] = useState(false);
  const lockedRef = useRef(false);

  const frameSize = Math.min(width * 0.7, height * 0.32, 260);
  const horizontalPad = Math.max(16, width * 0.05);

  const handleBack = useCallback(() => goBack(router), [router]);

  const handleScan = useCallback(
    async (data: string) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setOpening(true);

      const cat = await resolveCatFromQr(data);
      if (!cat) {
        lockedRef.current = false;
        setOpening(false);
        Alert.alert(
          "Not a CatCal tag",
          "This QR isn’t linked to a cat in your app. Register the cat first or try another tag.",
          [{ text: "OK" }]
        );
        return;
      }

      setActiveCatId(cat.id);
      router.replace(`/cat/${cat.id}`);
    },
    [resolveCatFromQr, router, setActiveCatId]
  );

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" />
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: horizontalPad }}>
          <Pressable onPress={handleBack} style={styles.backRow}>
            <ChevronLeft size={22} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
        <View style={styles.permissionBody}>
          <ScanLine size={44} color={colors.primary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access needed</Text>
          <Text style={[styles.permissionText, { color: colors.secondaryText }]}>
            Allow camera access to scan your cat&apos;s collar tag.
          </Text>
          <Pressable
            onPress={async () => {
              const result = await requestPermission();
              if (!result.granted) handleBack();
            }}
            style={[styles.allowButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.allowButtonText}>Allow camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={opening ? undefined : ({ data }) => handleScan(data)}
      />

      <SafeAreaView style={styles.overlay} edges={["bottom"]}>
        <View
          style={[
            styles.headerBar,
            {
              paddingTop: insets.top + 8,
              paddingHorizontal: horizontalPad,
            },
          ]}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <ChevronLeft size={22} color="#FFF" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text style={styles.headerTitle} numberOfLines={1}>
              Scan cat tag
            </Text>
          </View>
        </View>

        {/* Viewfinder — true vertical center between header and hint */}
        <View style={styles.scanArea}>
          <Viewfinder size={frameSize} color={colors.primary} />
          {opening ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.loadingText}>Opening profile…</Text>
            </View>
          ) : null}
        </View>

        {/* Single hint line */}
        <Text
          style={[
            styles.hint,
            {
              paddingHorizontal: horizontalPad,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          Point at your cat&apos;s collar QR code
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerBar: {
    position: "relative",
    minHeight: 44,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    zIndex: 2,
    paddingVertical: 6,
    paddingRight: 12,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  backText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 2,
  },
  headerTitleWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 96,
  },
  headerTitle: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
  scanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  loadingText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  hint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.65,
  },
  permissionBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  permissionText: {
    marginTop: 10,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  allowButton: {
    marginTop: 28,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  allowButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
