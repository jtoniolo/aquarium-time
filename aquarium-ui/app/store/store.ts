import { configureStore } from "@reduxjs/toolkit";
import aquariumsReducer, {
  type AquariumsState,
} from "@/app/store/aquariumsSlice";
import lightsReducer, { type LightsState } from "@/app/store/lightsSlice";
import sunReducer, { type SunState } from "@/app/store/sunSlice";

interface AppState {
  aquariums: AquariumsState;
  lights: LightsState;
  sun: SunState;
}

export const store = configureStore({
  reducer: {
    aquariums: aquariumsReducer,
    lights: lightsReducer,
    sun: sunReducer,
  },
});

export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;
