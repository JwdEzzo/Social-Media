import { useGetCurrentUserQuery } from "@/api/users/userApi";
import { useAuth } from "@/auth/useAuth";
import { skipToken } from "@reduxjs/toolkit/query/react";

/**
 * The logged-in user's own account (GetCurrentUserResponse, from GET /users/me,
 * so it includes the email), plus their username from the auth slice. Call it
 * wherever a component needs the current user, instead of pairing useAuth with
 * a user query or receiving loggedInUser as a prop.
 *
 * RTK Query caches the result, so calling it in many components still sends one request.
 *  - loggedInUser: undefined until loaded, or when nobody is logged in
 *  - isMe: whether a username belongs to the logged-in user
 *  - isLoading / isError / refetch: from the underlying query
 */
export function useCurrentUser() {
  const { username: loggedInUsername } = useAuth();

  // skipToken skips the request while logged out. The username only keys the cache;
  // the server works out who "me" is from the token.
  const { data: loggedInUser, ...query } = useGetCurrentUserQuery(
    loggedInUsername ?? skipToken,
  );

  function isMe(username: string | undefined): boolean {
    // 1. Guard clause: If no one is logged in, it definitely isn't "me"
    if (!loggedInUsername) {
      return false;
    }
    // 2. Guard clause: If someone IS logged in, check if the names match
    if (username === loggedInUsername) {
      return true;
    }
    // 3. Default fallback: The usernames do not match
    return false;
  }

  return { loggedInUser, loggedInUsername, isMe, ...query };
}
