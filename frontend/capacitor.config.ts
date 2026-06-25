import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.weddingsphere.app",
  appName: "WeddingSphere",
  webDir: "out",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;