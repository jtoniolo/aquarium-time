import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ConfigState {
  API_BASE_URL: string;
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  API_BASE_URL: "/",
  loading: false,
  error: null,
};

export const loadConfig = createAsyncThunk("config/load", async () => {
  const response = await fetch("/config/config.json");
  if (!response.ok) {
    throw new Error("Failed to load config");
  }
  return response.json();
});

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.API_BASE_URL = action.payload.API_BASE_URL;
      })
      .addCase(loadConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load config";
      });
  },
});

export default configSlice.reducer;
