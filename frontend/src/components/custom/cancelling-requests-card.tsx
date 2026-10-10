import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import {
  useCancelFollowRequestMutation,
  useGetAllOutgoingFollowRequestsInfiniteQuery,
  useGetOutgoingFollowRequestsCountQuery,
} from "@/api/followers/followApi";
import { Button } from "../ui/button";
import { usePagedList } from "@/hooks/usePagedList";

function CancellingRequestsCard() {
  const [isHovering, setIsHovering] = useState(false);

  const {
    items: outgoingRequests,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  } = usePagedList(useGetAllOutgoingFollowRequestsInfiniteQuery());

  const { data: outgoingRequestsCount } =
    useGetOutgoingFollowRequestsCountQuery();

  const [cancelFollowRequest] = useCancelFollowRequestMutation();

  if (outgoingRequests.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto mb-4 w-full max-w-lg">
      <Card className="w-full gap-4 rounded-xl border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Outgoing Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outgoingRequests.map((request) => (
            <div key={request.requestId}>
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
                    src={request.targetProfilePictureUrl ?? ""}
                    alt={`${request.targetUsername} pic`}
                  />
                  <span className="truncate text-sm font-semibold">
                    {request.targetUsername}
                  </span>
                </div>
                {/* Cancel Request Button*/}
                <Button
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`h-8 rounded-lg bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-none hover:bg-destructive hover:text-white ${isHovering && "bg-destructive text-white"}`}
                  onClick={() =>
                    cancelFollowRequest({
                      requestId: request.requestId,
                      requesterUsername: request.requesterUsername,
                    })
                  }
                >
                  Cancel
                </Button>
              </div>
              <div className="border-t border-border" />
            </div>
          ))}
          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-sm font-semibold text-sky-500 hover:text-sky-600"
              disabled={isFetchingNextPage}
              onClick={loadMore}
            >
              {isFetchingNextPage ? "Loading..." : "Show more"}
            </Button>
          )}
        </CardContent>
        <CardFooter>
          {outgoingRequestsCount === 0 && (
            <span className="text-sm text-muted-foreground">
              You have no follow requests
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default CancellingRequestsCard;
