import FollowList from "@/Pages/FollowPages/FollowList";

interface FollowerListProps {
  profileUsername: string;
}

function FollowerList({ profileUsername }: FollowerListProps) {
  return <FollowList profileUsername={profileUsername} listType="followers" />;
}

export default FollowerList;
