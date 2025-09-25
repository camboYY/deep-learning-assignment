// store/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --------------------
// Types
// --------------------
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  // add any other fields like email, fullName, etc.
}

export interface JwtResponse {
  token: string;
  expiresIn: number; // seconds
}

export interface UserResponse {
  id: number;
  username: string;
  // add any other fields returned by signup
}

// --------------------
// API
// --------------------
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
  }),
  endpoints: (builder) => ({
    login: builder.mutation<JwtResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<UserResponse, SignupRequest>({
      query: (data) => ({
        url: "signup",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // ignore backend logout failure
        } finally {
          clearAuthToken();
        }
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useLogoutMutation } =
  authApi;

// --------------------
// Auth Helpers
// --------------------
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("tokenExpiry");
};

export const isTokenValid = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("authToken");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry) return false;

  return Date.now() < Number(expiry);
};

// Custom hook
export const useIsAuth = () => isTokenValid();
