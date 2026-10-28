import { configureStore } from "@reduxjs/toolkit";
import studioReducer from "./slices/studioSlice";
import uiReducer from "./slices/uiSlice";
import portfolioReducer from "./slices/portfolioSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      studio: studioReducer,
      ui: uiReducer,
      portfolio: portfolioReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
