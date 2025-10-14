import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";
//
//

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
      invalidatesTags: ["PostLike"],
    }),
    getPostLikeCount: builder.query<number, number>({
      query: (postId) => ({
        url: `/post-likes/post/${postId}/like-count`,
        method: "GET",
      }),
      providesTags: ["PostLike"],
    }),
    isPostLiked: builder.query<boolean, number>({
      query: (postId) => ({
        url: `/post-likes/post/${postId}/is-liked`,
        method: "GET",
      }),
      providesTags: ["PostLike"],
    }),
  }),
});

export const {
  useTogglePostLikeMutation,
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} = postLikesApi;
