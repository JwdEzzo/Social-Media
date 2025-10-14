import type {
  SignUpRequestDto,
  UpdateCredentialsRequestDto,
  UpdateProfileRequestDto,
} from "@/types/requestTypes";
import type { GetUserResponseDto } from "@/types/responseTypes";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    signUp: builder.mutation<void, SignUpRequestDto>({
      query: (newUser) => ({
        url: "/users/sign-up",
        method: "POST",
        body: newUser,
      }),
    }),
    getUsers: builder.query<GetUserResponseDto[], void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "User" as const,
                id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    getUserByUsername: builder.query<GetUserResponseDto, string>({
      query: (username) => ({
        url: `/users/${username}`,
        method: "GET",
      }),
      providesTags: (result, error, username) => [
        { type: "User", id: username },
      ],
    }),
    getUsersExcludingCurrentUser: builder.query<GetUserResponseDto[], void>({
      query: () => ({
        url: "/users/excluded",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "User" as const,
                id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    updateUserCredentials: builder.mutation<
      void,
      { currentUsername: string } & UpdateCredentialsRequestDto
    >({
      query: ({ currentUsername, ...newCredentials }) => ({
        url: `/users/${currentUsername}/update-credentials`,
        method: "PUT",
        body: newCredentials,
      }),
      invalidatesTags: (result, error, { currentUsername }) => [
        { type: "User", id: currentUsername },
      ],
    }),

    updateUserProfile: builder.mutation<
      void,
      { username: string } & UpdateProfileRequestDto
    >({
      query: ({ username, ...newProfile }) => ({
        url: `/users/${username}/update-profile`,
        method: "PUT",
        body: newProfile,
      }),
      invalidatesTags: (result, error, { username }) => [
        { type: "User", id: username },
      ],
    }),
  }),
});

export const {
  useSignUpMutation,
  useGetUsersQuery,
  useGetUserByUsernameQuery,
  useUpdateUserCredentialsMutation,
  useUpdateUserProfileMutation,
} = userApi;
