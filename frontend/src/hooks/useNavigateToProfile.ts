import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate, type NavigateOptions } from "react-router-dom";

/**
 * Returns a function that opens a user's profile page: the logged-in user's own
 * profile route (/me) for themselves, the public profile route (/users)
 * for anyone else. Use it instead of choosing the route inline.
 * - options: passed through to navigate, e.g. { state } for the page being opened
 */
export function useNavigateToProfile() {
  const navigate = useNavigate();
  const { isMe } = useCurrentUser();

  return function navigateToProfile(
    username: string,
    options?: NavigateOptions,
  ): void {
    if (isMe(username)) {
      navigate("/me", options);
    } else {
      navigate(`/users/${username}`, options);
    }
  };
}
