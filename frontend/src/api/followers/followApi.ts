import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";

export const followApi = createApi({
  reducerPath: "followerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Follow", "User", "UserList"],
  endpoints: (builder) => ({
    toggleFollow: builder.mutation<void, string>({
      query: (followingUsername) => ({
        url: `/follows/following/${followingUsername}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, followingUsername) => [
        { type: "Follow", id: followingUsername },
        { type: "Follow", id: "COUNT" },
        { type: "User", id: "LIST" },
      ],
    }),
    getFollowerCount: builder.query<number, string>({
      query: (followingUsername) => ({
        url: `/follows/${followingUsername}/follower-count`,
        method: "GET",
      }),
      providesTags: (_result, _error, followingUsername) => [
        { type: "Follow", id: followingUsername },
        { type: "Follow", id: "COUNT" },
      ],
    }),
    getFollowingCount: builder.query<number, string>({
      query: (username) => ({
        url: `/follows/${username}/following-count`,
        method: "GET",
      }),
      providesTags: (_result, _error, username) => [
        { type: "Follow", id: username },
        { type: "Follow", id: "COUNT" },
      ],
    }),
    isFollowed: builder.query<boolean, string>({
      query: (followingUsername) => ({
        url: `/follows/already-follows/${followingUsername}`,
        method: "GET",
      }),
      providesTags: (_result, _error, followingUsername) => [
        { type: "Follow", id: followingUsername },
      ],
    }),
  }),
});

export const {
  useToggleFollowMutation,
  useGetFollowerCountQuery,
  useIsFollowedQuery,
  useGetFollowingCountQuery,
} = followApi;

export const { util: followApiUtil } = followApi;
