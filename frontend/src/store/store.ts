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

// Combine all reducers
const appReducer = combineReducers({
  auth: authSlice,
  viewPostModal: viewPostModalReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
  [commentApi.reducerPath]: commentApi.reducer,
  [postLikesApi.reducerPath]: postLikesApi.reducer,
  [commentLikesApi.reducerPath]: commentLikesApi.reducer,
  [followApi.reducerPath]: followApi.reducer,
  [commentRepliesApi.reducerPath]: commentRepliesApi.reducer,
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
    ]),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
