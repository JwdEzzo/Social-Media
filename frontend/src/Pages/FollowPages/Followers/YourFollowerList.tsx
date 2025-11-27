import { useAuth } from "@/auth/useAuth";
import FollowerList from "@/Pages/FollowPages/Followers/FollowerList";

function YourFollowerList() {
  const { username: loggedInUsername } = useAuth();
  return <FollowerList profileUsername={loggedInUsername || ""} />;
}

export default YourFollowerList;

export function YourFollowerListRouted() {
  return <YourFollowerList />;
}
