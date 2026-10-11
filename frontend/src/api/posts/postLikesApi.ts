import { api } from "@/api/api";

export const postLikesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    togglePostLike: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/post-likes/post/${postId}`,
        method: "POST",
      }),
      // Only this post's like count / is-liked, not every post's on screen
      invalidatesTags: (_result, _error, postId) => [
        { type: "PostLike", id: postId },
        // The profile's "liked" tab gains or loses this post
        { type: "Post", id: "LIKED" },
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
