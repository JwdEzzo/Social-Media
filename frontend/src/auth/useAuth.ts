import type { RootState } from "@/store/store";
import { useSelector } from "react-redux";

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    isAuthenticated: auth.isAuthenticated,
    token: auth.token,
    username: auth.username,
  };
};
