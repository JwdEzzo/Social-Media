import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";

export const followerApi = createApi({
  reducerPath: "followerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Follower"],
  endpoints: (builder) => ({
    toggleFollow: builder.mutation<void, string>({
      query: (followingUsername) => ({
        url: `/follows/following/${followingUsername}`,
        method: "POST",
      }),
      invalidatesTags: ["Follower"],
    }),
    getFollowerCount: builder.query<number, string>({
      query: (followingUsername) => ({
        url: `/follows/${followingUsername}/follower-count`,
        method: "GET",
      }),
      providesTags: ["Follower"],
    }),
    getFollowingCount: builder.query<number, string>({
      query: (username) => ({
        url: `/follows/${username}/following-count`,
        method: "GET",
      }),
      providesTags: ["Follower"],
    }),
    isFollowed: builder.query<boolean, string>({
      query: (followingUsername) => ({
        url: `/follows/already-follows/${followingUsername}`,
        method: "GET",
      }),
      providesTags: ["Follower"],
    }),
  }),
});

export const {
  useToggleFollowMutation,
  useGetFollowerCountQuery,
  useIsFollowedQuery,
  useGetFollowingCountQuery,
} = followerApi;

export const { util: followerApiUtil } = followerApi;
