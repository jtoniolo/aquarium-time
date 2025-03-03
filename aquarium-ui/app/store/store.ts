import { configureStore } from "@reduxjs/toolkit";
import aquariumsReducer, {
  type AquariumsState,
} from "@/app/store/aquariumsSlice";
import lightsReducer, { type LightsState } from "@/app/store/lightsSlice";
import sunReducer, { type SunState } from "@/app/store/sunSlice";
import configReducer from "./configSlice";

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
    config: configReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
