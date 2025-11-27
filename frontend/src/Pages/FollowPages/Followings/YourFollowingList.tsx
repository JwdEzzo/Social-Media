import { useAuth } from "@/auth/useAuth";
import FollowingList from "@/Pages/FollowPages/Followings/FollowingList";

function YourFollowingList() {
  const { username: loggedInUsername } = useAuth();
  return <FollowingList profileUsername={loggedInUsername || ""} />;
}

export default YourFollowingList;

export function YourFollowingListRouted() {
  return <YourFollowingList />;
}