import { logout } from "@/auth/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

/**
 * Returns a function that logs the user out and sends them to the landing page
 */
export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return function handleLogout(): void {
    dispatch(logout());
    navigate("/");
  };
}
