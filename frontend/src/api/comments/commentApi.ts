import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";
import { type WriteCommentRequestDto } from "@/types/requestTypes";
import { type GetCommentResponseDto } from "@/types/responseTypes";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    createComment: builder.mutation<void, WriteCommentRequestDto>({
      query: (requestDto) => ({
        url: "/comments/create-comment",
        body: requestDto,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Comment", id: "LIST" }, "Comment"],
    }),
    getCommentsByPostId: builder.query<
      GetCommentResponseDto[],
      { postId: number }
    >({
      query: ({ postId }) => ({
        url: `/comments/${postId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Comment" as const,
                id,
              })),
              { type: "Comment", id: "LIST" },
            ]
          : [{ type: "Comment", id: "LIST" }],
    }),
    getPostCommentCount: builder.query<number, number>({
      query: (postId) => ({
        url: `/comments/post/${postId}/comment-count`,
        method: "GET",
      }),
      providesTags: [{ type: "Comment", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useGetCommentsByPostIdQuery,
  useGetPostCommentCountQuery,
} = commentApi;
