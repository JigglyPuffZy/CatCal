import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

type QrSvgRef = {
  toDataURL: (callback: (data: string) => void) => void;
};

const CAPTURE_TIMEOUT_MS = 8000;

export function captureQrBase64(qrRef: QrSvgRef): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("QR capture timed out"));
    }, CAPTURE_TIMEOUT_MS);

    try {
      qrRef.toDataURL((data) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const base64 = data.replace(/^data:image\/png;base64,/, "");
        if (!base64) {
          reject(new Error("Empty QR image data"));
          return;
        }
        resolve(base64);
      });
    } catch (error) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(error);
      }
    }
  });
}

async function writeQrPng(base64: string, filename: string): Promise<string> {
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: "base64",
  });
  return uri;
}

export async function shareQrCode(base64: string, catName: string) {
  try {
    const uri = await writeQrPng(base64, `${catName.replace(/\s+/g, "-")}-qr.png`);
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert("Sharing unavailable", "Sharing is not supported on this device.");
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: `${catName}'s QR Code`,
      UTI: "public.png",
    });
  } catch {
    Alert.alert("Share failed", "Could not share the QR code. Please try again.");
  }
}

export async function saveQrToPhotos(base64: string, catName: string) {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to save the QR code for printing or a collar tag."
      );
      return false;
    }

    const uri = await writeQrPng(base64, `${catName.replace(/\s+/g, "-")}-qr.png`);
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert(
      "Saved",
      Platform.OS === "ios"
        ? "QR code saved to Photos. You can print it or attach it to a collar."
        : "QR code saved to your gallery. You can print it or attach it to a collar."
    );
    return true;
  } catch {
    Alert.alert("Save failed", "Could not save the QR code. Please try again.");
    return false;
  }
}
