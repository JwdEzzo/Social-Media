import {
  useGetFollowingsByUserIdInfiniteQuery,
  useGetUserByUsernameQuery,
} from "@/api/users/userApi";
import { usePagedList } from "@/hooks/usePagedList";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FollowingCard from "@/Pages/FollowPages/Followings/FollowingCard";
import { useGetFollowingCountQuery } from "@/api/followers/followApi";
import NavigateBack from "@/components/custom/navigate-back";
import CancellingRequestsCard from "@/components/custom/cancelling-requests-card";

interface FollowingListProps {
  profileUsername: string;
}

function FollowingList({ profileUsername }: FollowingListProps) {
  const { username: loggedInUsername } = useAuth();
  // Get logged in user
  const {
    data: loggedInUser,
    isLoading: isLoggedInUserLoading,
    isError: isLoggedInUserError,
  } = useGetUserByUsernameQuery(loggedInUsername!, {
    skip: !loggedInUsername,
  });

  // Get profile user
  const {
    data: profileUser,
    isLoading: isProfileUserLoading,
    isError: isProfileUserError,
  } = useGetUserByUsernameQuery(profileUsername, {
    skip: !profileUsername,
  });

  // Get users that the logged in user is following
  const followingsQuery = useGetFollowingsByUserIdInfiniteQuery(
    profileUser?.id ?? 0,
    {
      skip: !profileUser?.id,
    },
  );
  const { isLoading: isFollowingsLoading, isError: isFollowingsError } =
    followingsQuery;
  const {
    items: followings,
    loadMore: loadMoreFollowings,
    hasNextPage: hasMoreFollowings,
    isFetchingNextPage: isFetchingMoreFollowings,
  } = usePagedList(followingsQuery);

  // Get follower count
  const { data: followingCount } = useGetFollowingCountQuery(profileUsername!, {
    skip: !profileUsername,
  });

  // Loading state
  if (isFollowingsLoading || isLoggedInUserLoading || isProfileUserLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // User not found
  if (!loggedInUser) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-1 text-lg font-semibold">User Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested user does not exist
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isFollowingsError || isLoggedInUserError || isProfileUserError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="mb-1 text-lg font-semibold text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground">
            Could not load profile
          </p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-background px-4 pt-16 pb-10">
      <NavigateBack />
      <CancellingRequestsCard />
      <Card className="mx-auto w-full max-w-lg gap-4 rounded-xl border-border shadow-none">
        {/* Header with username and back button */}
        <CardHeader>
          <div className="flex items-center justify-center">
            <CardTitle className="text-center text-base font-semibold">
              {loggedInUsername === profileUsername
                ? "Your Following"
                : `${profileUsername}'s Followings`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {followingCount === 0 && profileUsername === loggedInUsername ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              You are not following anyone.
            </div>
          ) : followingCount === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {profileUsername} is not following anyone.
            </div>
          ) : (
            <>
              {followings.map((following) => (
                <FollowingCard
                  key={following.id}
                  following={following}
                  loggedInUsername={loggedInUsername!}
                  //
                />
              ))}
              <LoadMoreTrigger
                hasNextPage={hasMoreFollowings}
                isFetchingNextPage={isFetchingMoreFollowings}
                onLoadMore={loadMoreFollowings}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default FollowingList;
