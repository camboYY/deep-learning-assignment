import { configureStore } from "@reduxjs/toolkit";
import { attendanceApi } from "./attendanceApi";
import { authApi } from "./authApi";
import { employeeApi } from "./employeeApi";
import { faceApi } from "./faceApi";
import { userApi } from "./userApi";

export const store = configureStore({
  reducer: {
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [faceApi.reducerPath]: faceApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      attendanceApi.middleware,
      faceApi.middleware,
      authApi.middleware,
      userApi.middleware,
      employeeApi.middleware,
    ]),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
