/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "@/auth/authApi";
import { postApi } from "@/api/posts/postApi";
import { userApi } from "@/api/users/userApi";
import authSlice, { logout } from "@/auth/authSlice";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { commentApi } from "@/api/comments/commentApi";
import viewPostModalReducer from "@/slices/viewPostSlice";
import { postLikesApi } from "@/api/posts/postLikesApi";
import { commentLikesApi } from "@/api/comments/commentLikesApi";
import { followApi } from "@/api/followers/followApi";
import { commentRepliesApi } from "@/api/comments/commentRepliesApi";
import { commentReplyLikesApi } from "@/api/comments/commentReplyLikesApi";
import { postSavesApi } from "@/api/posts/postSavesApi";
import { replyModeSlice } from "@/slices/replyModeSlice";
import { editModeSlice } from "@/slices/editModeSlice";
import { notificationApi } from "@/api/notifications/notificationApi";

// Combine all reducers
const appReducer = combineReducers({
  auth: authSlice,
  viewPostModal: viewPostModalReducer,
  replyModeSlice: replyModeSlice.reducer,
  editModeSlice: editModeSlice.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [commentApi.reducerPath]: commentApi.reducer,
  [postLikesApi.reducerPath]: postLikesApi.reducer,
  [commentLikesApi.reducerPath]: commentLikesApi.reducer,
  [followApi.reducerPath]: followApi.reducer,
  [commentRepliesApi.reducerPath]: commentRepliesApi.reducer,
  [commentReplyLikesApi.reducerPath]: commentReplyLikesApi.reducer,
  [postSavesApi.reducerPath]: postSavesApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

// Root reducer that resets state on logout
const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    // Reset all state to undefined, which will reinitialize everything
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware,
      userApi.middleware,
      postApi.middleware,
      commentApi.middleware,
      postLikesApi.middleware,
      commentLikesApi.middleware,
      commentRepliesApi.middleware,
      followApi.middleware,
      commentReplyLikesApi.middleware,
      postSavesApi.middleware,
      notificationApi.middleware,
    ]),
});

setupListeners(store.dispatch);

/**
 * Every RTK Query api in the app, in one place.
 *
 * Cached *data* is language-neutral, but the `message` a response carries was resolved by the
 * backend for whatever Accept-Language was in effect when the request went out. After the user
 * switches language those cached messages are stale, so the caches get dropped and refetched.
 */
const apis = [
  authApi,
  userApi,
  postApi,
  commentApi,
  postLikesApi,
  commentLikesApi,
  followApi,
  commentRepliesApi,
  commentReplyLikesApi,
  postSavesApi,
  notificationApi,
];

export const resetAllApiState = () => (dispatch: AppDispatch) => {
  apis.forEach((api) => dispatch(api.util.resetApiState()));
};

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
