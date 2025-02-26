import { configureStore } from '@reduxjs/toolkit';
import aquariumsReducer, { type AquariumsState } from '@/app/store/aquariumsSlice';
import lightsReducer, { type LightsState } from '@/app/store/lightsSlice';

interface AppState {
  aquariums: AquariumsState;
  lights: LightsState;
}

export const store = configureStore({
  reducer: {
    aquariums: aquariumsReducer,
    lights: lightsReducer,
  },
});

export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;