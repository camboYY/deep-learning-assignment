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
  number: number; // current page
  size: number;
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
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
        `/admin/employee/all?page=${page}&size=${size}&name=${name}`,
      providesTags: ["Employee"],
    }),

    createEmployee: builder.mutation<EmployeeDTO, EmployeeRequest>({
      query: (body) => ({ url: `/admin/employee`, method: "POST", body }),
      invalidatesTags: ["Employee"],
    }),

    updateEmployee: builder.mutation<
      EmployeeDTO,
      { id: number; data: EmployeeRequest }
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
