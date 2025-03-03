import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { updateFromSocket } from "../store/sunSlice";
import type { AppDispatch, RootState } from "../store/store";

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
  const dispatch = useDispatch<AppDispatch>();
  const sunData = useSelector((state: RootState) => state.sun.current);
  const apiUrl = useSelector((state: RootState) => state.config.API_BASE_URL);

  useEffect(() => {
    // Only connect when we have a valid API URL
    if (!apiUrl) return;

    // Remove the /api prefix for WebSocket connections
    const socketUrl = apiUrl.replace("/api", "");
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Connected to sun socket");
    });

    socket.on("sunUpdate", (data: SunUpdate) => {
      dispatch(updateFromSocket(data));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from sun socket");
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, apiUrl]); // Re-connect when API URL changes

  return sunData;
}
