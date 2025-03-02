import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig() || { publicRuntimeConfig: {} };

export const API_BASE_URL =
  publicRuntimeConfig.apiUrl || "http://localhost:3000";
