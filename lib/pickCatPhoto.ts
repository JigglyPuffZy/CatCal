import { ActionSheetIOS, Alert, Linking, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

const GALLERY_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

const CAMERA_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: Platform.OS === "ios",
  aspect: [1, 1],
  quality: 0.85,
};

function permissionAlert(kind: "camera" | "gallery", canAskAgain: boolean) {
  const title =
    kind === "camera" ? "Camera access needed" : "Photo access needed";
  const message = canAskAgain
    ? kind === "camera"
      ? "Allow camera access to take a cat photo."
      : "Allow photo library access to add a cat photo."
    : "Turn on permission for CatCal in your device Settings.";

  if (!canAskAgain) {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => void Linking.openSettings() },
    ]);
    return;
  }

  Alert.alert(title, message);
}

function hasMediaAccess(permission: ImagePicker.MediaLibraryPermissionResponse) {
  return permission.granted || permission.accessPrivileges === "limited";
}

async function readPickerResult(
  result: ImagePicker.ImagePickerResult
): Promise<string | null> {
  if (!result.canceled && result.assets[0]?.uri) {
    return result.assets[0].uri;
  }
  return null;
}

async function readPendingCameraResult(): Promise<string | null> {
  if (!ImagePicker.getPendingResultAsync) return null;
  const pending = await ImagePicker.getPendingResultAsync();
  if (!pending || "code" in pending) return null;
  return readPickerResult(pending);
}

export async function pickCatPhotoFromGallery(): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!hasMediaAccess(permission)) {
      permissionAlert("gallery", permission.canAskAgain);
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync(GALLERY_OPTIONS);
    return readPickerResult(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not open your gallery.";
    Alert.alert("Gallery unavailable", message);
    return null;
  }
}

export async function pickCatPhotoFromCamera(): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      permissionAlert("camera", permission.canAskAgain);
      return null;
    }

    const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS);
    const uri = await readPickerResult(result);
    if (uri) return uri;

    return readPendingCameraResult();
  } catch (error) {
    const pendingUri = await readPendingCameraResult();
    if (pendingUri) return pendingUri;

    const message =
      error instanceof Error ? error.message : "Could not open the camera.";
    Alert.alert(
      "Camera unavailable",
      Platform.OS === "web"
        ? "Taking photos is not supported in the web preview. Use a phone with Expo Go, or choose from gallery."
        : message
    );
    return null;
  }
}

/** Native picker menu — must call camera/gallery from this callback (iOS user-gesture rule). */
export function showCatPhotoSourcePicker(onPicked: (uri: string) => void): void {
  const pickCamera = () => {
    void pickCatPhotoFromCamera().then((uri) => {
      if (uri) onPicked(uri);
    });
  };

  const pickGallery = () => {
    void pickCatPhotoFromGallery().then((uri) => {
      if (uri) onPicked(uri);
    });
  };

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: "Add photo",
        message: "Choose how to add your cat's photo",
        options: ["Cancel", "Take Photo", "Choose from Gallery"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) pickCamera();
        if (buttonIndex === 2) pickGallery();
      }
    );
    return;
  }

  if (Platform.OS === "android") {
    Alert.alert("Add photo", "Choose how to add your cat's photo", [
      { text: "Take photo", onPress: pickCamera },
      { text: "Choose from gallery", onPress: pickGallery },
      { text: "Cancel", style: "cancel" },
    ]);
    return;
  }

  Alert.alert("Add photo", "Choose how to add your cat's photo", [
    { text: "Choose from gallery", onPress: pickGallery },
    { text: "Cancel", style: "cancel" },
  ]);
}
