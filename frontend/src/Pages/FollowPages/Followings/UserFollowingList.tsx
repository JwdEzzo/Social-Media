import FollowingList from '@/Pages/FollowPages/Followings/FollowingList';
import { useParams } from 'react-router-dom';

function UserFollowingList() {
  const { username } = useParams<{ username: string }>();
  return <FollowingList profileUsername={username || ''} />;
}

export default UserFollowingList;

export function UserFollowingListRouted() {
  return <UserFollowingList />;
}
