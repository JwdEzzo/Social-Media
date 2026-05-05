import FollowerList from "@/Pages/FollowPages/Followers/FollowerList";
import { useParams } from "react-router-dom";

function UserFollowerList() {
  const { username } = useParams<{ username: string }>();

  return <FollowerList profileUsername={username || ""} />;
}

export default UserFollowerList;

export function UserFollowerListRouted() {
  return <UserFollowerList />;
}
