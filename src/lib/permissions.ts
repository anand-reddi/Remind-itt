import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";

// Define a constant for toast styling to ensure consistency
const TOAST_STYLE = {
  position: "top" as const, // Changed to top to avoid bottom nav completely
  duration: "long" as const,
  style: {
    marginTop: "16px", // Add margin from top instead
  },
};

export async function requestStoragePermission(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return true; // Always return true for web platform
    }

    // First check if we already have permission
    const currentPermissions = await Filesystem.checkPermissions();
    if (currentPermissions.publicStorage === "granted") {
      return true;
    }

    // Show a toast explaining why we need permission
    await Toast.show({
      text: "Storage access is needed to save and load your data",
      ...TOAST_STYLE,
    });

    // Request permission through Filesystem plugin
    const permission = await Filesystem.requestPermissions();

    if (permission.publicStorage === "granted") {
      return true;
    } else {
      // Show a toast explaining how to enable permission manually
      await Toast.show({
        text: "Please enable storage permission in your device settings to use this feature",
        ...TOAST_STYLE,
      });
      return false;
    }
  } catch (error) {
    console.error("Error requesting storage permission:", error);
    return false;
  }
}

export async function checkStoragePermission(): Promise<boolean> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return true; // Always return true for web platform
    }

    // Check permission through Filesystem plugin
    const permission = await Filesystem.checkPermissions();
    return permission.publicStorage === "granted";
  } catch (error) {
    console.error("Error checking storage permission:", error);
    return false;
  }
}
