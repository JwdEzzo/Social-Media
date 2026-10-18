import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useAuth } from "@/auth/useAuth";
import { skipToken } from "@reduxjs/toolkit/query/react";

// The logged-in user's full profile (GetUserResponse), plus their username from the
// auth slice. Call it wherever a component needs the current user, instead of
// pairing useAuth with useGetUserByUsernameQuery or receiving loggedInUser as a prop.
// RTK Query caches the result, so calling it in many components still sends one request.
// - loggedInUser: undefined until loaded, or when nobody is logged in
// - isMe: whether a username belongs to the logged-in user
// - isLoading / isError / refetch: from the underlying query
export function useCurrentUser() {
  const { username: loggedInUsername } = useAuth();

  // skipToken skips the request while logged out, so there's no need for username!
  const { data: loggedInUser, ...query } = useGetUserByUsernameQuery(
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
