import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Light, DiscoveredLight } from "../types";
import type { RootState } from "./store";

interface LightsState {
  items: Light[];
  discoveredLights: DiscoveredLight[];
  loading: boolean;
  error: string | null;
}

const initialState: LightsState = {
  items: [],
  discoveredLights: [],
  loading: false,
  error: null,
};

export const discoverLights = createAsyncThunk(
  "lights/discover",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const response = await axios.get<DiscoveredLight[]>(
      `${state.config.API_BASE_URL}/lights/discover`
    );
    return response.data;
  }
);

export const fetchLights = createAsyncThunk(
  "lights/fetchAll",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const response = await axios.get<Light[]>(
      `${state.config.API_BASE_URL}/lights`
    );
    return response.data;
  }
);

export const assignLight = createAsyncThunk(
  "lights/assign",
  async (
    { entityId, aquariumId }: { entityId: string; aquariumId: string },
    { getState }
  ) => {
    const state = getState() as RootState;
    const response = await axios.post<Light>(
      `${state.config.API_BASE_URL}/lights`,
      {
        entity_id: entityId,
        aquariumId,
      }
    );
    return response.data;
  }
);

export const removeLight = createAsyncThunk(
  "lights/remove",
  async (entityId: string, { getState }) => {
    const state = getState() as RootState;
    await axios.delete(`${state.config.API_BASE_URL}/lights/${entityId}`);
    return entityId;
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
        // Add/update the light in items array
        const index = state.items.findIndex(
          (light) => light.entity_id === action.payload.entity_id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }

        // Remove the light from discoveredLights
        state.discoveredLights = state.discoveredLights.filter(
          (light) => light.entity_id !== action.payload.entity_id
        );
      })
      .addCase(removeLight.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (light) => light.entity_id !== action.payload
        );
      });
  },
});

export default lightsSlice.reducer;
export type { LightsState };
