import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  FetchBaseQueryError,
  QueryReturnValue,
} from "@reduxjs/toolkit/query";

export interface FaceVerifyPayload {
  imageBase64: string;
}

export interface FaceEnrollPayload {
  id: string;
  imageBase64: Array<String>;
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
  message: String;
  status: String;
  employee_id: string;
}

// Shape required for RTK Query errors

export const faceApi = createApi({
  reducerPath: "faceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost/ml',// process.env.NEXT_PUBLIC_API_URL,
  }),
  /**
   * @typedef {Object} FaceVerifyPayload
   * @property {string} imageBase64 - Base64 encoded image string
   *
   * @typedef {Object} FaceVerifyResponse
   * @property {boolean} matched - Whether the face is matched
   * @property {number} score - Similarity score between the input image and the enrolled image
   * @property {string} employeeId - Employee ID if the face is matched
   *
   * @typedef {Object} FaceEnrollPayload
   * @property {string} id - Employee ID
   * @property {string} imageBase64 - Base64 encoded image string
   *
   * @typedef {Object} FaceEnrollResponse
   * @property {boolean} success - Whether the enrollment was successful
   * @property {string} employeeId - Employee ID if the enrollment was successful
   *
   * @typedef {Object} CustomError
   * @property {number|string} status - Status code of the error
   * @property {any} data - Error data
   * @property {string} error - Error message
   *
   * @description Face API endpoints
   * @property {Function} verifyFace - Verify face against enrolled faces
   * @property {Function} enrollFace - Enroll a new face
   * @property {Function} resetFace - Reset all enrolled faces
   */
  endpoints: (builder) => ({
    verifyFace: builder.mutation<FaceVerifyResponse, FaceVerifyPayload>({
      queryFn: async (
        payload
      ): Promise<QueryReturnValue<FaceVerifyResponse, FetchBaseQueryError>> => {
        try {
          const formData = new FormData();
          const blob = await (await fetch(payload.imageBase64)).blob();
          formData.append("file", blob, "face.jpg");

          const res = await fetch(`http://localhost:80/ml/verify`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            return {
              error: {
                status: res.status,
                data: await res.text(),
              } as FetchBaseQueryError,
              meta: undefined, // 👈 FIX
            };
          }

          const json = (await res.json()) as FaceVerifyResponse;
          return {
            data: json,
            meta: undefined, // 👈 FIX
          };
        } catch (err: any) {
          return {
            error: {
              status: "FETCH_ERROR",
              error: err.message,
            } as FetchBaseQueryError,
            meta: undefined, // 👈 FIX
          };
        }
      },
    }),

    enrollFace: builder.mutation<FaceEnrollResponse, FormData>({
      query: (formData) => ({
        url: "/enroll",
        method: "POST",
        body: formData,
        // Let the browser set the Content-Type (multipart/form-data)
      }),
    }),

  }),
});

export const { useVerifyFaceMutation, useEnrollFaceMutation } = faceApi;
