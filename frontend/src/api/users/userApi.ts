import type {
  SignUpRequest,
  UpdateCredentialsRequest,
} from "@/types/request-types";
import type {
  GetCurrentUserResponse,
  GetUserResponse,
  LoginResponse,
  SearchUserResponse,
  SignUpResponse,
} from "@/types/response-types";
import { api } from "@/api/api";
import type { PagedModel } from "@/types/api-response";
import {
  pagedInfiniteQueryOptions,
  pageParams,
  providePagedTags,
} from "@/api/pagination";
import type { AccountStatus } from "@/types/enums";

type UsersPage = PagedModel<GetUserResponse>;
// The likers endpoint returns the slimmer SearchUserResponse
type LikersPage = PagedModel<SearchUserResponse>;

// Stable order so pages don't shift between requests: ?page=N&size=10&sort=id,asc
const userPageParams = (pageParam: number) => pageParams(pageParam, "id,asc");

export const userApi = api.injectEndpoints({
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
    // The logged-in user's own account (includes email). The server reads who "me" is
    // from the token; the username arg isn't sent, it only keys the cache so a
    // different user logging in on the same tab never gets the previous user's entry.
    getCurrentUser: builder.query<GetCurrentUserResponse, string>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      // Same tags as getUserByUsername, so the profile/credentials/status mutations
      // that invalidate { User, username } refresh this too
      providesTags: (result) =>
        result
          ? [
              { type: "User", id: result.id },
              { type: "User", id: result.username },
            ]
          : [],
    }),

    getUserByUsername: builder.query<GetUserResponse, string>({
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

    getUsersWhoLikedPost: builder.infiniteQuery<LikersPage, number, number>({
      infiniteQueryOptions: pagedInfiniteQueryOptions,
      query: ({ queryArg: postId, pageParam }) => ({
        url: `/users/liked-post/${postId}`,
        method: "GET",
        params: userPageParams(pageParam),
      }),
      // PostLike/postId: togglePostLike invalidates it, so a like or unlike refreshes the list
      providesTags: (result, _error, postId) =>
        providePagedTags(result, "User", [
          { type: "User", id: "LIST" },
          { type: "PostLike", id: postId },
        ]),
    }),

    updateUserCredentials: builder.mutation<
      LoginResponse,
      { currentUsername: string } & UpdateCredentialsRequest
    >({
      query: ({ currentUsername, ...newCredentials }) => ({
        url: `/users/username/${currentUsername}/update-credentials`,
        method: "PUT",
        body: newCredentials,
      }),
      invalidatesTags: (result, _error, { currentUsername }) => {
        // Renamed: refetching anything now would still send the old (dead) token,
        // because setCredentials runs only after this. The new username starts
        // fresh cache entries anyway, so there's nothing to invalidate.
        if (result && result.username !== currentUsername) return [];

        return [
          { type: "User", id: currentUsername },
          { type: "UserList", id: "ALL" },
          { type: "UserList", id: "EXCLUDED" },
        ];
      },
    }),

    toggleAccountStatus: builder.mutation<AccountStatus, { username: string }>({
      // username is only used for cache tags; the server reads the caller from the token
      query: () => ({
        url: `/users/toggle-account-status`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { username }) => [
        { type: "User", id: username },
        { type: "UserList", id: "ALL" },
        { type: "UserList", id: "EXCLUDED" },
      ],
    }),

    // Profile update; omit profileImage to keep the current picture.
    // Omit bioText to keep the bio; "" clears it.
    updateUserProfileWithUpload: builder.mutation<
      void,
      { username: string; bioText?: string; profileImage?: File }
    >({
      query: ({ username, bioText, profileImage }) => {
        const formData = new FormData();
        if (bioText !== undefined) {
          formData.append("bioText", bioText);
        }
        if (profileImage) {
          formData.append("profileImage", profileImage);
        }
        return {
          url: `/users/username/${username}/update-profile-upload`,
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
  useGetCurrentUserQuery,
  useGetUserByUsernameQuery,
  useGetFollowersByUserIdInfiniteQuery,
  useGetFollowingsByUserIdInfiniteQuery,
  useGetUsersWhoLikedPostInfiniteQuery,
  useGetUsersExcludingCurrentUserInfiniteQuery,
  useUpdateUserCredentialsMutation,
  useUpdateUserProfileWithUploadMutation,
  useToggleAccountStatusMutation,
} = userApi;

export const { util: userApiUtil } = userApi;
