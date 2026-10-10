import {
  useGetFollowersByUserIdInfiniteQuery,
  useGetUserByUsernameQuery,
} from "@/api/users/userApi";
import { usePagedList } from "@/hooks/usePagedList";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FollowerCard from "@/Pages/FollowPages/Followers/FollowerCard";
import { useGetFollowerCountQuery } from "@/api/followers/followApi";
import IncomingRequestsCard from "@/components/custom/incoming-request-card";
import NavigateBack from "@/components/custom/navigate-back";

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

  const followersQuery = useGetFollowersByUserIdInfiniteQuery(
    profileUser?.id ?? 0,
    {
      skip: !profileUser?.id,
    },
  );
  const { isLoading: isFollowersLoading, isError: isFollowersError } =
    followersQuery;
  const {
    items: followers,
    loadMore: loadMoreFollowers,
    hasNextPage: hasMoreFollowers,
    isFetchingNextPage: isFetchingMoreFollowers,
  } = usePagedList(followersQuery);

  const { data: followerCount } = useGetFollowerCountQuery(profileUsername!, {
    skip: !profileUsername,
  });

  if (isFollowersLoading || isLoggedInUserLoading || isProfileUserLoading) {
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

  if (isFollowersError || isLoggedInUserError || isProfileUserError) {
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
      <IncomingRequestsCard />
      <Card className="mx-auto w-full max-w-lg gap-4 rounded-xl border-border shadow-none">
        {/* Header with username and back button */}
        <CardHeader>
          <div className="flex items-center justify-center">
            <CardTitle className="text-center text-base font-semibold">
              {loggedInUsername === profileUsername
                ? "Your Followers"
                : `${profileUsername}'s Followers`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {followerCount === 0 && profileUsername === loggedInUsername ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              You have no followers yet.
            </div>
          ) : followerCount === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No one is following {profileUsername}
            </div>
          ) : (
            <div>
              {followers.map((follower) => (
                <FollowerCard
                  key={follower.id}
                  follower={follower}
                  loggedInUsername={loggedInUsername!}
                />
              ))}
              <LoadMoreTrigger
                hasNextPage={hasMoreFollowers}
                isFetchingNextPage={isFetchingMoreFollowers}
                onLoadMore={loadMoreFollowers}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default FollowerList;
