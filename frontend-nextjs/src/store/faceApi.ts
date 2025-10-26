import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface FaceEnrollPayload {
  id: string;
  imageBase64: Array<string>;
  deny_if_exists: boolean;
  prevent_duplicate_face: boolean;
  threshold: number;
  enforce_same_person: boolean;
  intra_threshold: number;
}
export interface FaceVerifyResponse {
  matched: boolean;
  score: number;
  employee_id: string;
  status: string;
}
export interface FaceEnrollResponse {
  success: boolean;
  message: string;
  status: string;
  employee_id: string;
}

export const faceApi = createApi({
  reducerPath: "faceApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost/ml" }),
  endpoints: (builder) => ({
    enrollFace: builder.mutation<
      FaceEnrollResponse,
      { id: string; files: File[] }
    >({
      query: ({ id, files }) => {
        const formData = new FormData();
        formData.append("id", id);
        // ✅ prevent crash if files is undefined
        if (files && files.length > 0) {
          files.forEach((file) => formData.append("imageBase64", file));
        }
        return { url: "/enroll", method: "POST", body: formData };
      },
    }),
    verifyFace: builder.mutation<FaceVerifyResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/verify", method: "POST", body: formData };
      },
    }),
  }),
});

export const { useEnrollFaceMutation, useVerifyFaceMutation } = faceApi;
