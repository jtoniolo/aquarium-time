import { configureStore } from "@reduxjs/toolkit";
import aquariumsReducer from "@/app/store/aquariumsSlice";
import lightsReducer from "@/app/store/lightsSlice";
import sunReducer from "@/app/store/sunSlice";
import configReducer from "./configSlice";

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
