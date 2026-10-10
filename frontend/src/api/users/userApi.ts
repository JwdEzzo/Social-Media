import type {
  SignUpRequest,
  UpdateCredentialsRequestDto,
  UpdateProfileRequestDto,
} from "@/types/request-types";
import type {
  GetUserResponseDto,
  SearchUserResponseDto,
  SignUpResponse,
} from "@/types/response-types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";

type UsersPage = PagedModel<GetUserResponseDto>;

// Stable order so pages don't shift between requests: ?page=N&size=10&sort=id,asc
const userPageParams = (pageParam: number) => pageParams(pageParam, "id,asc");

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "UserList", "Followers", "Followings"],
  endpoints: (builder) => ({
    signUp: builder.mutation<SignUpResponse, SignUpRequest>({
      query: (newUser) => ({
        url: "/users/sign-up",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: [{ type: "UserList", id: "ALL" }],
    }),
    // Infinite queries: one cache entry holds every page fetched so far.
    // <ResultPerPage, QueryArg, PageParam> - PageParam is Spring's zero-based page index.
    getUsers: builder.infiniteQuery<UsersPage, void, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: "/users",
        method: "GET",
        params: userPageParams(pageParam),
      }),
      providesTags: (result) =>
        providePagedTags(result, "User", [{ type: "UserList", id: "ALL" }]),
    }),
    getUserByUsername: builder.query<GetUserResponseDto, string>({
      query: (username) => ({
        url: `/users/username/${username}`,
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
    getUsersExcludingCurrentUser: builder.infiniteQuery<
      UsersPage,
      void,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ pageParam }) => ({
        url: "/users/excluded",
        method: "GET",
        params: userPageParams(pageParam),
      }),
      providesTags: (result) =>
        providePagedTags(result, "User", [
          { type: "UserList", id: "EXCLUDED" },
        ]),
    }),
    getFollowersByUserId: builder.infiniteQuery<UsersPage, number, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: userId, pageParam }) => ({
        url: `/users/followers/${userId}`,
        method: "GET",
        params: userPageParams(pageParam),
      }),
      providesTags: (result, _error, userId) =>
        providePagedTags(result, "User", [
          { type: "Followers", id: userId },
          { type: "User", id: "LIST" },
        ]),
    }),
    getFollowingsByUserId: builder.infiniteQuery<UsersPage, number, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: userId, pageParam }) => ({
        url: `/users/followings/${userId}`,
        method: "GET",
        params: userPageParams(pageParam),
      }),
      providesTags: (result) =>
        providePagedTags(result, "User", [{ type: "User", id: "LIST" }]),
    }),

    searchUsersByUsername: builder.infiniteQuery<
      PagedModel<SearchUserResponseDto>,
      string,
      number
    >({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: username, pageParam }) => ({
        url: `/users/search/${username}`,
        method: "GET",
        params: userPageParams(pageParam),
      }),
      providesTags: (result) =>
        providePagedTags(result, "User", [{ type: "UserList", id: "ALL" }]),
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

    toggleAccountStatus: builder.mutation<void, { targetUserId: number }>({
      query: ({ targetUserId }) => ({
        url: `/users/toggle-account-status/${targetUserId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        { type: "User", id: targetUserId },
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
  useGetUsersInfiniteQuery,
  useGetUserByUsernameQuery,
  useGetFollowersByUserIdInfiniteQuery,
  useGetFollowingsByUserIdInfiniteQuery,
  useGetUsersExcludingCurrentUserInfiniteQuery,
  useSearchUsersByUsernameInfiniteQuery,
  useUpdateUserCredentialsMutation,
  useUpdateUserProfileWithUrlMutation,
  useUpdateUserProfileWithUploadMutation,
  useToggleAccountStatusMutation,
} = userApi;

export const { util: userApiUtil } = userApi;
