import { currentLanguage } from "@/i18n";
import type { ApiSuccessResponse } from "@/types/apiResponse";
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
    // This api builds its own baseQuery instead of reusing baseQueryWithReauth, so it needs
    // its own Accept-Language - otherwise a failed login reports in the browser's language.
    prepareHeaders: (headers) => {
      headers.set("Accept-Language", currentLanguage());
      return headers;
    },
  }),
  endpoints(builder) {
    return {
      login: builder.mutation<LoginResponse, LoginRequest>({
        query: (credentials) => ({
          url: "/login",
          method: "POST",
          body: credentials,
        }),
        /**
         * The controller answers with ApiResponse<LoginResponse>, so the token lives one level
         * down under `data`. Unwrapping here keeps the envelope a transport detail: callers of
         * useLoginMutation still receive a plain LoginResponse.
         *
         * Typed as the success branch rather than ApiResponse<LoginResponse> because RTK Query
         * only reaches transformResponse on a 2xx - a failure goes to the error channel, where
         * the body is an ApiErrorResponse instead.
         */
        transformResponse: (response: ApiSuccessResponse<LoginResponse>) =>
          response.data,
      }),
    };
  },
});

export const { useLoginMutation } = authApi;
