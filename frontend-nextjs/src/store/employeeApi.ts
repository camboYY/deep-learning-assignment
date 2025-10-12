// store/employeeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface EmployeeDTO {
  id: number;
  name: string;
  dob: string;
  gender: string;
  imageUrl?: string;
  department?: string;
  userId: number;
}

export interface EmployeeRequest {
  name: string;
  dob: string;
  gender: string;
  imageUrl?: string;
  department?: string;
  userId: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      // IMPORTANT: don't set Content-Type here; let FormData set its own boundary.
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Employee"],
  endpoints: (builder) => ({
    getEmployees: builder.query<
      PagedResponse<EmployeeDTO>,
      { page: number; size: number; name?: string }
    >({
      query: ({ page, size, name = "" }) =>
        `/admin/employee/all?page=${page}&size=${size}&name=${encodeURIComponent(name)}`,
      providesTags: ["Employee"],
    }),

    // 👇 Accept JSON (EmployeeRequest) OR multipart (FormData)
    createEmployee: builder.mutation<EmployeeDTO, EmployeeRequest | FormData>({
      query: (data) => {
        let body: BodyInit;
        let headers: Record<string, string> = {};    
        if (data instanceof FormData) {
          // FormData (e.g., file uploads)
          body = data;
          // Don't set Content-Type, let the browser handle it for multipart
        } else {
          // Plain JSON
          body = JSON.stringify(data);
          headers["Content-Type"] = "application/json";
        }
    
        return {
          url: `/admin/employee`,
          method: "POST",
          body,
          headers,
        };
      },
      invalidatesTags: ["Employee"],
    }),

    updateEmployee: builder.mutation<
      EmployeeDTO,
      { id: number; data: EmployeeRequest | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/employee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Employee"],
    }),

    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({ url: `/admin/employee/${id}`, method: "DELETE" }),
      invalidatesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
