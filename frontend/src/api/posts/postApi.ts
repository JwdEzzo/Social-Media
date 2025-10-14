import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import type { CreatePostRequestDto } from "@/types/requestTypes";
import type { GetPostResponseDto } from "@/types/responseTypes";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    createPost: builder.mutation<string, CreatePostRequestDto>({
      query: (newPost) => ({
        url: "/posts/create-post",
        method: "POST",
        body: newPost,
      }),
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
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostsByUsernameQuery,
  useGetPostsExcludingCurrentUserQuery,
  useGetPostByIdQuery,
} = postApi;
