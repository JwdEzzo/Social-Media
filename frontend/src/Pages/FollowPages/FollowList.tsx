import {
  useGetFollowersByUserIdInfiniteQuery,
  useGetFollowingsByUserIdInfiniteQuery,
  useGetUserByUsernameQuery,
} from "@/api/users/userApi";
import {
  useGetFollowerCountQuery,
  useGetFollowingCountQuery,
} from "@/api/followers/followApi";
import { usePagedList } from "@/hooks/usePagedList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IncomingRequestsCard from "@/components/custom/incoming-request-card";
import CancellingRequestsCard from "@/components/custom/cancelling-requests-card";
import NavigateBack from "@/components/custom/navigate-back";
import FollowButton from "@/components/custom/follow-button";
import UserRow from "@/components/custom/user-row";
import {
  FullPageLoading,
  FullPageStatus,
} from "@/components/custom/status-card";

interface FollowListProps {
  profileUsername: string;
  // followers: who follows profileUsername; following: who profileUsername follows
  listType: "followers" | "following";
}

// The followers or following page for a profile. Both lists look the same; they differ
// in which query fills them, the texts, and the request card shown above
// (incoming requests on followers, outgoing ones on following).
function FollowList({ profileUsername, listType }: FollowListProps) {
  const isFollowers = listType === "followers";

  const {
    loggedInUser,
    isMe,
    isLoading: isLoggedInUserLoading,
    isError: isLoggedInUserError,
  } = useCurrentUser();

  const {
    data: profileUser,
    isLoading: isProfileUserLoading,
    isError: isProfileUserError,
  } = useGetUserByUsernameQuery(profileUsername, {
    skip: !profileUsername,
  });

  // Both queries are declared (hooks can't be conditional); only the one for this list runs
  const followersQuery = useGetFollowersByUserIdInfiniteQuery(
    profileUser?.id ?? 0,
    { skip: !profileUser?.id || !isFollowers },
  );
  const followingsQuery = useGetFollowingsByUserIdInfiniteQuery(
    profileUser?.id ?? 0,
    { skip: !profileUser?.id || isFollowers },
  );
  const usersQuery = isFollowers ? followersQuery : followingsQuery;
  const { isLoading: isUsersLoading, isError: isUsersError } = usersQuery;

  const followers = usePagedList(followersQuery);
  const followings = usePagedList(followingsQuery);
  const {
    items: users,
    loadMore: loadMoreUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: isFetchingMoreUsers,
  } = isFollowers ? followers : followings;

  const { data: followerCount } = useGetFollowerCountQuery(profileUsername, {
    skip: !profileUsername || !isFollowers,
  });
  const { data: followingCount } = useGetFollowingCountQuery(profileUsername, {
    skip: !profileUsername || isFollowers,
  });
  const userCount = isFollowers ? followerCount : followingCount;

  const isOwnList = isMe(profileUsername);

  const title = isFollowers
    ? isOwnList
      ? "Your Followers"
      : `${profileUsername}'s Followers`
    : isOwnList
      ? "Your Following"
      : `${profileUsername}'s Followings`;

  const emptyMessage = isFollowers
    ? isOwnList
      ? "You have no followers yet."
      : `No one is following ${profileUsername}`
    : isOwnList
      ? "You are not following anyone."
      : `${profileUsername} is not following anyone.`;

  if (isUsersLoading || isLoggedInUserLoading || isProfileUserLoading) {
    return <FullPageLoading label="Loading profile..." />;
  }

  if (!loggedInUser) {
    return (
      <FullPageStatus
        title="User Not Found"
        message="The requested user does not exist"
      />
    );
  }

  if (isUsersError || isLoggedInUserError || isProfileUserError) {
    return (
      <FullPageStatus
        isError
        title="Error"
        message="Could not load profile"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-svh w-full bg-background px-4 pt-16 pb-10">
      <NavigateBack />
      {isFollowers ? <IncomingRequestsCard /> : <CancellingRequestsCard />}
      <Card className="mx-auto w-full max-w-lg gap-4 rounded-xl border-border shadow-none">
        <CardHeader>
          <div className="flex items-center justify-center">
            <CardTitle className="text-center text-base font-semibold">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {userCount === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  username={user.username}
                  profilePictureUrl={user.profilePictureUrl}
                  action={
                    !isMe(user.username) && (
                      <FollowButton username={user.username} />
                    )
                  }
                />
              ))}
              <LoadMoreTrigger
                hasNextPage={hasMoreUsers}
                isFetchingNextPage={isFetchingMoreUsers}
                onLoadMore={loadMoreUsers}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FollowList;
