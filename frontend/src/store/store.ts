/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/api/api";
import { authApi } from "@/api/auth/authApi";
import authSlice, { logout } from "@/auth/authSlice";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import viewPostModalReducer from "@/slices/viewPostSlice";
import { replyModeSlice } from "@/slices/replyModeSlice";
import { editModeSlice } from "@/slices/editModeSlice";

// Combine all reducers
const appReducer = combineReducers({
  auth: authSlice,
  viewPostModal: viewPostModalReducer,
  replyModeSlice: replyModeSlice.reducer,
  editModeSlice: editModeSlice.reducer,
  // One cache for every endpoint (see api/api.ts); login has its own, see authApi.ts
  [api.reducerPath]: api.reducer,
  [authApi.reducerPath]: authApi.reducer,
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
    getDefaultMiddleware().concat([api.middleware, authApi.middleware]),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
