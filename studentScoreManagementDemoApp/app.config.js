import "dotenv/config";

export default {
  expo: {
    name: "studentScoreManagementDemoApp",
    slug: "studentScoreManagementDemoApp",
    version: "1.0.0",
    orientation: "portrait",
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGE_SENDER_ID,
      appId: process.env.APP_ID,

      clientIdHoang: process.env.CLIENT_ID_HOANG,
      clientSecretHoang: process.env.CLIENT_SECRET_HOANG,

      clientIdHai: process.env.CLIENT_ID_HAI,
      clientSecretHai: process.env.CLIENT_SECRET_HAI,
    },
  },
};
