import Constants from "expo-constants";

type ExtraConfig = { apiBaseUrl?: string };

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as ExtraConfig | undefined)?.apiBaseUrl ??
  "http://localhost:8000/api/v1";
