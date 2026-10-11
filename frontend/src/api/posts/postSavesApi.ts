import { api } from "@/api/api";

export const postSavesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    togglePostSave: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/post-saves/post/${postId}`,
        method: "POST",
      }),
      // Only this post's save count / is-saved, not every post's on screen
      invalidatesTags: (_result, _error, postId) => [
        { type: "PostSave", id: postId },
        // The profile's "saved" tab gains or loses this post
        { type: "Post", id: "SAVED" },
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
