import {
  useCancelFollowRequestMutation,
  useGetAllOutgoingFollowRequestsInfiniteQuery,
} from "@/api/followers/followApi";
import { Button } from "../ui/button";
import { usePagedList } from "@/hooks/usePagedList";
import RequestListCard from "@/components/custom/request-list-card";
import UserRow from "@/components/custom/user-row";

function CancellingRequestsCard() {
  const {
    items: outgoingRequests,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  } = usePagedList(useGetAllOutgoingFollowRequestsInfiniteQuery());

  const [cancelFollowRequest] = useCancelFollowRequestMutation();

  if (outgoingRequests.length === 0) {
    return null;
  }

  return (
    <RequestListCard
      title="Outgoing Requests"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={loadMore}
    >
      {outgoingRequests.map((request) => (
        <UserRow
          key={request.requestId}
          className="border-b border-border py-2"
          username={request.targetUsername}
          profilePictureUrl={request.targetProfilePictureUrl}
          action={
            // Cancel Request Button: turns red on hover
            <Button
              className="h-8 rounded-lg bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-destructive hover:text-white"
              onClick={() =>
                cancelFollowRequest({
                  requestId: request.requestId,
                  requesterUsername: request.requesterUsername,
                })
              }
            >
              Cancel
            </Button>
          }
        />
      ))}
    </RequestListCard>
  );
}

export default CancellingRequestsCard;
