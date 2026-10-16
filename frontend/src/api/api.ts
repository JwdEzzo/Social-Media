import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/api/public/baseApi";

// The app's single RTK Query API. Every feature file adds its endpoints with
// api.injectEndpoints, so they all share one cache and one set of tags: a mutation
// in any file can invalidate a query in any other (e.g. togglePostSave -> saved posts).
// Components never need to call invalidateTags themselves.
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Post",
    "PostLike",
    "PostSave",
    "Comment",
    "CommentLike",
    "CommentReply",
    "CommentReplyLike",
    "User",
    "UserList",
    "Followers",
    "Followings",
    "Follow",
    "Notification",
    "RecentSearch",
  ],
  // Refetch everything that's on screen after the connection comes back.
  // refetchOnFocus is opted into per hook instead (see notification hooks), since doing it
  // for every query would refetch each card's like/comment/save counts on every tab switch.
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
