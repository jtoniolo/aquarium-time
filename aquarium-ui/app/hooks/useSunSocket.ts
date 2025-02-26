import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { API_BASE_URL } from "../config";
import { updateFromSocket } from "../store/sunSlice";
import type { AppDispatch, RootState } from "../store/store";

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
  const dispatch = useDispatch<AppDispatch>();
  const sunData = useSelector((state: RootState) => state.sun.current);

  useEffect(() => {
    const socket = io(SOCKET_URL);

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
  }, [dispatch]);

  return sunData;
}
