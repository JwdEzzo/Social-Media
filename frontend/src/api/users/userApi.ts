import type {
  SignUpRequestDto,
  UpdateCredentialsRequestDto,
  UpdateProfileRequestDto,
} from "@/types/requestTypes";
import type {
  GetUserResponseDto,
  SearchUserResponseDto,
} from "@/types/responseTypes";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "UserList", "Followers", "Followings"],
  endpoints: (builder) => ({
    signUp: builder.mutation<void, SignUpRequestDto>({
      query: (newUser) => ({
        url: "/users/sign-up",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "UserList", id: "ALL" }],
    }),
    getUsers: builder.query<GetUserResponseDto[], void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "UserList", id: "ALL" },
            ]
          : [{ type: "UserList", id: "ALL" }],
    }),
    getUserByUsername: builder.query<GetUserResponseDto, string>({
      query: (username) => ({
        url: `/users/${username}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "User", id: result.id },
              { type: "User", id: result.username },
            ]
          : [],
    }),
    getUsersExcludingCurrentUser: builder.query<GetUserResponseDto[], void>({
      query: () => ({
        url: "/users/excluded",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "UserList", id: "EXCLUDED" },
            ]
          : [{ type: "UserList", id: "EXCLUDED" }],
    }),
    getFollowersByUserId: builder.query<GetUserResponseDto[], number>({
      query: (userId) => ({
        url: `/users/followers/${userId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [
        { type: "Followers", id: userId },
        { type: "User", id: "LIST" },
      ],
    }),
    getFollowingsByUserId: builder.query<GetUserResponseDto[], number>({
      query: (userId) => ({
        url: `/users/followings/${userId}`,
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

    searchUsersByUsername: builder.query<SearchUserResponseDto[], string>({
      query: (username) => ({
        url: `/users/search/${username}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "UserList", id: "ALL" },
            ]
          : [{ type: "UserList", id: "ALL" }],
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
      invalidatesTags: (_result, _error, { currentUsername }) => [
        { type: "User", id: currentUsername },
        { type: "UserList", id: "ALL" },
        { type: "UserList", id: "EXCLUDED" },
      ],
    }),

    // URL-based profile update
    updateUserProfileWithUrl: builder.mutation<
      void,
      { username: string } & UpdateProfileRequestDto
    >({
      query: ({ username, ...updateData }) => ({
        url: `/users/${username}/update-profile-url`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (_result, _error, { username }) => [
        { type: "User", id: username },
        { type: "UserList", id: "ALL" },
        { type: "UserList", id: "EXCLUDED" },
      ],
    }),

    // File upload profile update
    updateUserProfileWithUpload: builder.mutation<
      void,
      { username: string; bioText?: string; profileImage: File }
    >({
      query: ({ username, bioText, profileImage }) => {
        const formData = new FormData();
        if (bioText) {
          formData.append("bioText", bioText);
        }
        formData.append("profileImage", profileImage);
        return {
          url: `/users/${username}/update-profile-upload`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { username }) => [
        { type: "User", id: username },
        { type: "UserList", id: "ALL" },
        { type: "UserList", id: "EXCLUDED" },
      ],
    }),
  }),
});

export const {
  useSignUpMutation,
  useGetUsersQuery,
  useGetUserByUsernameQuery,
  useGetFollowersByUserIdQuery,
  useGetFollowingsByUserIdQuery,
  useGetUsersExcludingCurrentUserQuery,
  useSearchUsersByUsernameQuery,
  useUpdateUserCredentialsMutation,
  useUpdateUserProfileWithUrlMutation,
  useUpdateUserProfileWithUploadMutation,
} = userApi;

export const { util: userApiUtil } = userApi;
