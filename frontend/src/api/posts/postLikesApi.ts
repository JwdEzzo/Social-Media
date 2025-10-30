import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";

export const postLikesApi = createApi({
  reducerPath: "postLikesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PostLike"],
  endpoints: (builder) => ({
    togglePostLike: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/post-likes/post/${postId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        "PostLike",
        { type: "PostLike", id: postId },
      ],
    }),
    getPostLikeCount: builder.query<number, number>({
      query: (postId) => ({
        url: `/post-likes/post/${postId}/like-count`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "PostLike", id: postId },
      ],
    }),
    isPostLiked: builder.query<boolean, number>({
      query: (postId) => ({
        url: `/post-likes/post/${postId}/is-liked`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "PostLike", id: postId },
      ],
    }),
  }),
});

export const {
  useTogglePostLikeMutation,
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} = postLikesApi;

export const { util: postLikesApiUtil } = postLikesApi;
