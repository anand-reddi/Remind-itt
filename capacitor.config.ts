
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c67f43a71d9c4832a0327b70a14483fb',
  appName: 'Remind itt',
  webDir: 'dist',
  server: {
    url: 'https://c67f43a7-1d9c-4832-a032-7b70a14483fb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
