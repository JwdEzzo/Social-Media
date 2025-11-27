import {
  useGetFollowersByUserIdQuery,
  useGetUserByUsernameQuery,
} from "@/api/users/userApi";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FollowerCard from "@/Pages/FollowPages/Followers/FollowerCard";
import { ModeToggle } from "@/components/ModeToggle";

interface FollowerListProps {
  profileUsername: string;
}

function FollowerList({ profileUsername }: FollowerListProps) {
  const { username: loggedInUsername } = useAuth();

  const {
    data: loggedInUser,
    isLoading: isLoggedInUserLoading,
    isError: isLoggedInUserError,
  } = useGetUserByUsernameQuery(loggedInUsername!, {
    skip: !loggedInUsername,
  });

  const {
    data: profileUser,
    isLoading: isProfileUserLoading,
    isError: isProfileUserError,
  } = useGetUserByUsernameQuery(profileUsername, {
    skip: !profileUsername,
  });

  const {
    data: followers,
    isLoading: isFollowersLoading,
    isError: isFollowersError,
  } = useGetFollowersByUserIdQuery(profileUser?.id ?? 0, {
    skip: !profileUser?.id,
  });

  console.log(followers);

  if (isFollowersLoading || isLoggedInUserLoading || isProfileUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold">User Not Found</h2>
          <p>The requested user does not exist</p>
        </div>
      </div>
    );
  }

  if (isFollowersError || isLoggedInUserError || isProfileUserError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-500">Could not load profile</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen dark:bg-gray-900 bg-white pt-10">
      <Card className="bg-white dark:bg-gray-800 mx-auto w-1/2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {profileUsername}'s Followers
            </CardTitle>
            <ModeToggle />
          </div>
        </CardHeader>
        <CardContent>
          {followers?.map((follower) => (
            <FollowerCard
              key={follower.id}
              follower={follower}
              loggedInUsername={loggedInUsername!}
              //
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
export default FollowerList;
