import FollowingList from "@/Pages/FollowPages/Followings/FollowingList";
import { useParams } from "react-router-dom";

function UserFollowingList() {
  // Update the parameter name to match your route
  const { username } = useParams<{ username: string }>();
  console.log(username);

  return <FollowingList profileUsername={username || ""} />;
}

export default UserFollowingList;

export function UserFollowingListRouted() {
  return <UserFollowingList />;
}