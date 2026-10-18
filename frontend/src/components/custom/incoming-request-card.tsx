import {
  useAcceptFollowRequestMutation,
  useDeclineFollowRequestMutation,
  useGetIncomingFollowRequestsCountQuery,
  useGetIncomingFollowRequestsInfiniteQuery,
} from "@/api/followers/followApi";
import { usePagedList } from "@/hooks/usePagedList";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigateToProfile } from "@/hooks/useNavigateToProfile";
import RequestListCard from "@/components/custom/request-list-card";
import UserRow from "@/components/custom/user-row";

function IncomingRequestsCard() {
  const navigateToProfile = useNavigateToProfile();
  const { loggedInUser } = useCurrentUser();

  const {
    items: followRequests,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  } = usePagedList(useGetIncomingFollowRequestsInfiniteQuery());

  const { data: incomingRequestCount } =
    useGetIncomingFollowRequestsCountQuery();

  const [acceptOneFollowRequest] = useAcceptFollowRequestMutation();
  const [declineOneFollowRequest] = useDeclineFollowRequestMutation();

  if (loggedInUser?.accountStatus !== "PRIVATE") {
    return null;
  }

  if (incomingRequestCount === 0) {
    return null;
  }

  return (
    <RequestListCard
      title="Incoming Requests"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={loadMore}
    >
      {followRequests.map((followRequest) => (
        <UserRow
          key={followRequest.requestId}
          className="border-b border-border py-2"
          username={followRequest.requesterUsername}
          profilePictureUrl={followRequest.requesterProfilePictureUrl}
          onClick={() => navigateToProfile(followRequest.requesterUsername)}
          action={
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="h-8 rounded-lg bg-sky-500 px-4 font-semibold text-white shadow-none hover:bg-sky-600"
                onClick={() =>
                  acceptOneFollowRequest({
                    requestId: followRequest.requestId,
                    requesterUsername: followRequest.requesterUsername,
                  })
                }
              >
                Accept
              </Button>
              <Button
                className="h-8 rounded-lg bg-secondary px-4 font-semibold text-secondary-foreground shadow-none hover:bg-secondary/80"
                size="sm"
                onClick={() =>
                  declineOneFollowRequest({
                    requestId: followRequest.requestId,
                    requesterUsername: followRequest.requesterUsername,
                  })
                }
              >
                Decline
              </Button>
            </div>
          }
        />
      ))}
    </RequestListCard>
  );
}

export default IncomingRequestsCard;
