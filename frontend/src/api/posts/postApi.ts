import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import type {
  CreatePostRequestDto,
  EditPostWithUploadRequestDto,
  EditPostWithUrlRequestDto,
} from "@/types/requestTypes";
import type { GetPostResponseDto } from "@/types/responseTypes";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post"],
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    createPost: builder.mutation<string, CreatePostRequestDto>({
      query: (newPost) => ({
        url: "/posts/create-post",
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }, "Post"],
    }),
    uploadPost: builder.mutation<string, { description: string; image: File }>({
      query: ({ description, image }) => {
        const formData = new FormData(); // Creates an empty FormData object
        formData.append("description", description); // append for description
        formData.append("image", image); // append for image
        return {
          url: "/posts/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Post", id: "LIST" }, "Post"],
    }),
    getPosts: builder.query<GetPostResponseDto[], void>({
      query: () => ({
        url: "/posts",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Post" as const,
                id,
              })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    getPostsCount: builder.query<number, string>({
      query: (username) => ({
        url: `/posts/${username}/count`,
        method: "GET",
      }),
      providesTags: (_result, _error, username) => [
        { type: "Post", id: `COUNT_${username}` }, // Unique tag for each user's count
      ],
    }),
    getPostById: builder.query<GetPostResponseDto, number>({
      query: (id) => ({
        url: `/posts/get-by-id/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Post", id }],
    }),

    getPostsByUsername: builder.query<GetPostResponseDto[], string>({
      query: (username) => ({
        url: `/posts/${username}`,
        method: "GET",
      }),
      providesTags: (_result, _error, username) => [
        { type: "Post", id: username },
        { type: "Post", id: "LIST" },
      ],
    }),
    getPostsExcludingCurrentUser: builder.query<GetPostResponseDto[], void>({
      query: () => ({
        url: "/posts/excluded",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Post" as const,
                id,
              })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    getPostsLikedByCurrentUser: builder.query<GetPostResponseDto[], void>({
      query: () => ({
        url: "/posts/liked-by-me",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    getFollowingPostsByUserId: builder.query<GetPostResponseDto[], void>({
      query: () => ({
        url: "/posts/my-followers",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),
    editPostWithUrl: builder.mutation<
      void,
      EditPostWithUrlRequestDto & { postId: number }
    >({
      query: ({ postId, ...body }) => ({
        url: `/posts/edit-with-url/${postId}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),

    editPostWithUpload: builder.mutation<
      void,
      EditPostWithUploadRequestDto & { postId: number }
    >({
      query: ({ postId, ...body }) => {
        const formData = new FormData();
        formData.append("description", body.description);
        formData.append("image", body.image);
        return {
          url: `/posts/edit-with-upload/${postId}`,
          method: "PUT",
          body: body,
        };
      },
    }),

    deletePostByPostId: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/posts/delete/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "Post", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useUploadPostMutation,
  useGetPostsQuery,
  useGetPostsByUsernameQuery,
  useGetPostsExcludingCurrentUserQuery,
  useGetPostByIdQuery,
  useGetPostsCountQuery,
  useGetPostsLikedByCurrentUserQuery,
  useGetFollowingPostsByUserIdQuery,
  useEditPostWithUrlMutation,
  useEditPostWithUploadMutation,
  useDeletePostByPostIdMutation,
} = postApi;

export const { util: postApiUtil } = postApi;
