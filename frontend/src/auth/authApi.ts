import type { LoginRequest } from "@/types/requestTypes";
import type { LoginResponse } from "@/types/responseTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

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
