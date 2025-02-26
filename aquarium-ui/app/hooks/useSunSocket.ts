import { useState, useEffect } from "react";
import io from "socket.io-client";
import { API_BASE_URL } from "../config";

// Remove the /api prefix for WebSocket connections
const SOCKET_URL = API_BASE_URL.replace("/api", "");

export interface SunUpdate {
  on: boolean;
  brightness: number;
  rgbw: {
    red: number;
    green: number;
    blue: number;
    white: number;
  };
  timeOfDay: "sunrise" | "day" | "sunset" | "night";
  cyclePercentage: number;
}

export function useSunSocket() {
  const [sunData, setSunData] = useState<SunUpdate | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Connected to sun socket");
    });

    socket.on("sunUpdate", (data: SunUpdate) => {
      setSunData(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from sun socket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return sunData;
}
