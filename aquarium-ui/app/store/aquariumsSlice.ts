import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Aquarium } from '../types';
import { API_BASE_URL } from '../config';

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
  'aquariums/fetchAll',
  async () => {
    const response = await axios.get<Aquarium[]>(`${API_BASE_URL}/aquariums`);
    return response.data;
  }
);

export const createAquarium = createAsyncThunk(
  'aquariums/create',
  async (aquarium: Partial<Aquarium>) => {
    const response = await axios.post<Aquarium>(`${API_BASE_URL}/aquariums`, aquarium);
    return response.data;
  }
);

const aquariumsSlice = createSlice({
  name: 'aquariums',
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
        state.error = action.error.message || 'Failed to fetch aquariums';
      })
      .addCase(createAquarium.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default aquariumsSlice.reducer;
export type { AquariumsState };