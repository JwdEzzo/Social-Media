import type { LoginRequest } from "@/types/request-types";
import type { LoginResponse } from "@/types/response-types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

// Kept outside the shared api (api/api.ts) on purpose: login must use a plain fetchBaseQuery,
// because baseQueryWithReauth dispatches logout() on any 401 - which a wrong password is.
// It has no tags or cached data for other endpoints to depend on.
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/instagram/users",
  }),
  endpoints(builder) {
    return {
      login: builder.mutation<LoginResponse, LoginRequest>({
        query: (credentials) => ({
          url: "/login",
          method: "POST",
          body: credentials,
        }),
      }),
    };
  },
});

export const { useLoginMutation } = authApi;
