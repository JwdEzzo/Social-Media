import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../public/baseApi";

export const postSavesApi = createApi({
  reducerPath: "postSavesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PostSave"],
  endpoints: (builder) => ({
    togglePostSave: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/post-saves/post/${postId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        "PostSave",
        { type: "PostSave", id: postId },
      ],
    }),
    isPostSaved: builder.query<boolean, number>({
      query: (postId) => ({
        url: `/post-saves/post/${postId}/is-saved`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "PostSave", id: postId },
      ],
    }),
    getPostSaveCount: builder.query<number, number>({
      query: (postId) => ({
        url: `/post-saves/post/${postId}/save-count`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "PostSave", id: postId },
      ],
    }),
  }),
});

export const {
  useTogglePostSaveMutation,
  useIsPostSavedQuery,
  useGetPostSaveCountQuery,
} = postSavesApi;

export const { util: postSavesApiUtil } = postSavesApi;
