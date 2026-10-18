import FollowList from "@/Pages/FollowPages/FollowList";

interface FollowingListProps {
  profileUsername: string;
}

function FollowingList({ profileUsername }: FollowingListProps) {
  return <FollowList profileUsername={profileUsername} listType="following" />;
}

export default FollowingList;
