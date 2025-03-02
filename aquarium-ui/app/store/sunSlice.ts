import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";
import type { SunUpdate } from "../hooks/useSunSocket";
import { SunConfig } from "../types";

interface DistributionData {
  time: string;
  brightness: number;
  red: number;
  green: number;
  blue: number;
  white: number;
  color_temp: number;
}

interface SunState {
  current: SunUpdate | null;
  distributionData: {
    [aquariumId: string]: DistributionData[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: SunState = {
  current: null,
  distributionData: {},
  loading: false,
  error: null,
};

export const fetchLatestSun = createAsyncThunk("sun/fetchLatest", async () => {
  const response = await axios.get<SunUpdate>(`${API_BASE_URL}/suns/latest`);
  return response.data;
});

export const fetchDistributionData = createAsyncThunk(
  "sun/fetchDistributionData",
  async ({
    aquariumId,
    config,
  }: {
    aquariumId: string;
    config?: SunConfig;
  }) => {
    const response = await axios.post(
      `${API_BASE_URL}/suns/distribution`,
      { config },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("Failed to fetch distribution data");
    }
    return { aquariumId, data: response.data };
  }
);

const sunSlice = createSlice({
  name: "sun",
  initialState,
  reducers: {
    updateFromSocket: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestSun.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestSun.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchLatestSun.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch sun state";
      })
      .addCase(fetchDistributionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistributionData.fulfilled, (state, action) => {
        state.loading = false;
        state.distributionData[action.payload.aquariumId] = action.payload.data;
      })
      .addCase(fetchDistributionData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch distribution data";
      });
  },
});

export const { updateFromSocket } = sunSlice.actions;
export default sunSlice.reducer;
export type { SunState };
