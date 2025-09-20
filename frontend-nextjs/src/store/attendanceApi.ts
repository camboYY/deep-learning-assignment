import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Attendance {
  id: number;
  name: string;
  employeeId: string;
  clockIn: string;
  clockOut: string;
  overtime?: string;
  picture: string;
  location: string;
  note: string;
}

export interface AttendanceRequest {
  employeeId: number;
  status?: "PRESENT" | "LATE" | "ABSENT" | "OVERTIME";
}

export interface AttendanceResponse {
  id: number;
  employeeId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  checkIn: string;
  checkOut: string;
}

// Pagination response
export interface PaginatedAttendance {
  content: Attendance[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/admin/attendance`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAllAttendance: builder.query<
      PaginatedAttendance,
      { page?: number; size?: number }
    >({
      query: ({ page = 0, size = 10 }) => `?page=${page}&size=${size}`,
      providesTags: ["Attendance"],
    }),
    getAttendanceById: builder.query<Attendance, number>({
      query: (id) => `/${id}`,
      providesTags: ["Attendance"],
    }),
    getAttendanceByEmployeeId: builder.query<
      PaginatedAttendance,
      { employeeId: number; page?: number; size?: number }
    >({
      query: ({ employeeId, page = 0, size = 10 }) =>
        `/getByEmployeeId/${employeeId}?page=${page}&size=${size}`,
      providesTags: ["Attendance"],
    }),
    createAttendance: builder.mutation<AttendanceResponse, AttendanceRequest>({
      query: (data) => ({
        url: "",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),
    updateAttendance: builder.mutation<
      AttendanceResponse,
      { id: number; data: AttendanceRequest }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),
    deleteAttendance: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  useGetAllAttendanceQuery,
  useGetAttendanceByIdQuery,
  useGetAttendanceByEmployeeIdQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = attendanceApi;
