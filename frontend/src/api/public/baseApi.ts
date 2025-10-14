// store/apis/baseApi.ts - Base query with auth
import { logout } from "@/auth/authSlice";
import type { RootState } from "@/store/store";
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

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
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }

  return result;
};
export { baseQueryWithReauth };
