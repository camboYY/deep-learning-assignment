import { configureStore } from "@reduxjs/toolkit";
import { attendanceApi } from "./attendanceApi";
import { authApi } from "./authApi";
import { faceApi } from "./faceApi";

export const store = configureStore({
  reducer: {
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [faceApi.reducerPath]: faceApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      attendanceApi.middleware,
      faceApi.middleware,
      authApi.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
