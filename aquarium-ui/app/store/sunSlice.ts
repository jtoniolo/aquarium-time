import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";
import type { SunUpdate } from "../hooks/useSunSocket";

interface SunState {
  current: SunUpdate | null;
  loading: boolean;
  error: string | null;
}

const initialState: SunState = {
  current: null,
  loading: false,
  error: null,
};

export const fetchLatestSun = createAsyncThunk("sun/fetchLatest", async () => {
  const response = await axios.get<SunUpdate>(
    `${API_BASE_URL}/suns/latest/enhanced`
  );
  return response.data;
});

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
      });
  },
});

export const { updateFromSocket } = sunSlice.actions;
export default sunSlice.reducer;
export type { SunState };
