import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface UserDTO {
  id: number;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: string[];
}

export interface UserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  roles: string[];
}

export const userApi = createApi({
  reducerPath: "userApi",
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
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<UserDTO[], void>({
      query: () => "users/all",
      providesTags: ["User"],
    }),
    getUserById: builder.query<UserDTO, number>({
      query: (id) => `users/${id}`,
      providesTags: ["User"],
    }),
    createUser: builder.mutation<UserDTO, UserRequest>({
      query: (body) => ({
        url: "users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<UserDTO, { id: number; data: UserRequest }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
