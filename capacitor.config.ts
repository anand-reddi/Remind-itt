import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.c67f43a71d9c4832a0327b70a14483fb",
  appName: "Remind itt",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
    allowNavigation: ["*"],
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_remind_itt",
      iconColor: "#4f46e5",
      sound: "default",
      channelId: "remind-itt-notifications",
      channelName: "Task Reminders",
      importance: 4,
      allowBadge: true,
    },
    SplashScreen: {
      launchShowDuration: 1000,
      autoHide: true,
      backgroundColor: "#ffffffff",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    App: {
      backgroundMode: "persist",
      hideStatusBar: false,
      webContentsDebuggingEnabled: true,
    },
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#ffffff",
    captureInput: true,
    useLegacyBridge: false,
  },
};

export default config;
