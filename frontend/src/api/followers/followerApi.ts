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
        url: `/follows/following/${followingUsername}/follower-count`,
        method: "GET",
      }),
      providesTags: ["Follower"],
    }),
    isFollowing: builder.query<boolean, string>({
      query: (followingUsername) => ({
        url: `/follows/following/${followingUsername}/is-following`,
        method: "GET",
      }),
      providesTags: ["Follower"],
    }),
  }),
});

export const {
  useToggleFollowMutation,
  useGetFollowerCountQuery,
  useIsFollowingQuery,
} = followerApi;
