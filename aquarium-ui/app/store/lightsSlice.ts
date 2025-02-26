import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Light } from "../types";
import { API_BASE_URL } from "../config";

interface LightsState {
  items: Light[];
  discoveredLights: Light[];
  loading: boolean;
  error: string | null;
}

const initialState: LightsState = {
  items: [],
  discoveredLights: [],
  loading: false,
  error: null,
};

export const discoverLights = createAsyncThunk("lights/discover", async () => {
  const response = await axios.get<Light[]>(`${API_BASE_URL}/lights/discover`);
  return response.data;
});

export const fetchLights = createAsyncThunk("lights/fetchAll", async () => {
  const response = await axios.get<Light[]>(`${API_BASE_URL}/lights`);
  return response.data;
});

export const assignLight = createAsyncThunk(
  "lights/assign",
  async ({
    entityId,
    aquariumId,
  }: {
    entityId: string;
    aquariumId: string;
  }) => {
    const response = await axios.post<Light>(`${API_BASE_URL}/lights`, {
      entity_id: entityId,
      aquariumId,
    });
    return response.data;
  }
);

const lightsSlice = createSlice({
  name: "lights",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(discoverLights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(discoverLights.fulfilled, (state, action) => {
        state.loading = false;
        state.discoveredLights = action.payload;
      })
      .addCase(discoverLights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to discover lights";
      })
      .addCase(fetchLights.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(assignLight.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (light) => light.entity_id === action.payload.entity_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      });
  },
});

export default lightsSlice.reducer;
export type { LightsState };
