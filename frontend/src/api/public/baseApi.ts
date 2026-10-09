// store/apis/baseApi.ts - Base query with auth
import { logout } from "@/auth/authSlice";
import type { RootState } from "@/store/store";
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { z as zod } from "zod";

export type ApiError = {
  status: number | string;
  message: string;
  fieldErrors: Record<string, string[]>;
};

const envelopeSchema = zod.object({
  message: zod.string().optional(),
  errors: zod.record(zod.array(zod.string())).optional(),
});

function toApiError(error: FetchBaseQueryError): ApiError {
  if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    return {
      status: error.status,
      message: "Cannot connect to server. Please try again later.",
      fieldErrors: {},
    };
  }
  // An HTML page or other junk body fails the parse and falls back to the generic message.
  const body = envelopeSchema.safeParse(error.data);
  return {
    status: error.status,
    message:
      (body.success && body.data.message) ||
      "Something went wrong. Please try again.",
    fieldErrors: (body.success && body.data.errors) || {},
  };
}

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8080/api/instagram",
  credentials: "include", // Send back our httpOnly cookies with every request
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; // Get the auth token from the store
    if (token) {
      headers.set("authorization", `Bearer ${token}`); // Give the request a header with the token
    }
    return headers; // We are attaching the access token to the headers with every request, likewise with the cookie, we are attaching the credentials in the cookie everytime
  },
});

// Wrap the baseQuery with reauth logic, because if the token is expired or invalid, we can reattempt after sending the refresh token and getting a new access token
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    if (result.error.status === 401) api.dispatch(logout());
    return { ...result, error: toApiError(result.error) };
  }
  return result;
};
export { baseQueryWithReauth };
