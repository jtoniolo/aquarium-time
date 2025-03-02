import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Aquarium } from "../types";
import { API_BASE_URL } from "../config";

interface AquariumsState {
  items: Aquarium[];
  loading: boolean;
  error: string | null;
}

const initialState: AquariumsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAquariums = createAsyncThunk(
  "aquariums/fetchAll",
  async () => {
    const response = await axios.get<Aquarium[]>(`${API_BASE_URL}/aquariums`);
    return response.data;
  }
);

export const createAquarium = createAsyncThunk(
  "aquariums/create",
  async (aquarium: Partial<Aquarium>) => {
    const response = await axios.post<Aquarium>(
      `${API_BASE_URL}/aquariums`,
      aquarium
    );
    return response.data;
  }
);

export const updateAquarium = createAsyncThunk(
  "aquariums/update",
  async (aquarium: Partial<Aquarium>) => {
    const response = await axios.put<Aquarium>(
      `${API_BASE_URL}/aquariums/${aquarium.id}`,
      aquarium
    );
    return response.data;
  }
);

export const deleteAquarium = createAsyncThunk(
  "aquariums/delete",
  async (id: string) => {
    await axios.delete(`${API_BASE_URL}/aquariums/${id}`);
    return id;
  }
);

const aquariumsSlice = createSlice({
  name: "aquariums",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAquariums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAquariums.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAquariums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch aquariums";
      })
      .addCase(createAquarium.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAquarium.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteAquarium.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export default aquariumsSlice.reducer;
export type { AquariumsState };
