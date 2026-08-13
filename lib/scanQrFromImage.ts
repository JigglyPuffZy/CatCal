import { Alert, Linking } from "react-native";
import { scanFromURLAsync } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

/** Pick a QR screenshot or saved QR image from the gallery and return decoded text. */
export async function pickAndScanQrFromGallery(): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const hasAccess =
      permission.granted || permission.accessPrivileges === "limited";

    if (!hasAccess) {
      Alert.alert(
        "Photo access needed",
        permission.canAskAgain
          ? "Allow photo library access to scan a saved QR code image."
          : "Turn on photo access for CatCal in Settings.",
        permission.canAskAgain
          ? [{ text: "OK" }]
          : [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => void Linking.openSettings() },
            ]
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return null;
    }

    const uri = result.assets[0].uri;
    const scans = await scanFromURLAsync(uri, ["qr"]);

    if (!scans.length || !scans[0]?.data) {
      Alert.alert(
        "No QR code found",
        "Could not read a CatCal QR in that image. Try a clearer screenshot where the QR fills most of the picture."
      );
      return null;
    }

    return scans[0].data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not scan that image.";
    Alert.alert("Scan failed", message);
    return null;
  }
}
