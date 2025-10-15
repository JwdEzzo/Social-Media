import { authApi } from "@/auth/authApi";
import { postApi } from "@/api/posts/postApi";
import { userApi } from "@/api/users/userApi";
import authSlice from "@/auth/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { commentApi } from "@/api/comments/commentApi";
import viewPostModalReducer from "@/slices/viewPostSlice";
import { postLikesApi } from "@/api/posts/postLikesApi";
import { commentLikesApi } from "@/api/comments/commentLikesApi";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    viewPostModal: viewPostModalReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [postLikesApi.reducerPath]: postLikesApi.reducer,
    [commentLikesApi.reducerPath]: commentLikesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      authApi.middleware,
      userApi.middleware,
      postApi.middleware,
      commentApi.middleware,
      postLikesApi.middleware,
      commentLikesApi.middleware,
    ]),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
