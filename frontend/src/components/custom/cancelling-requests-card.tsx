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
    <div className="mb-10">
      <Card className="bg-white dark:bg-gray-800 mx-auto w-1/2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold leading-tight tracking-tight">
            Outgoing Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outgoingRequests.map((request) => (
            <div key={request.requestId}>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center justify-start py-2">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={request.targetProfilePictureUrl ?? ""}
                    alt={`${request.targetUsername} pic`}
                  />
                  <span className="px-3">{request.targetUsername}</span>
                </div>
                {/* Cancel Request Button*/}
                <Button
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`bg-red-400 hover:bg-red-500 ${isHovering && "bg-red-600"}`}
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
              <div className="border-t border-gray-600" />
            </div>
          ))}
          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              disabled={isFetchingNextPage}
              onClick={loadMore}
            >
              {isFetchingNextPage ? "Loading..." : "Show more"}
            </Button>
          )}
        </CardContent>
        <CardFooter>
          {outgoingRequestsCount === 0 && (
            <span className="text-sm text-gray-400">
              You have no follow requests
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default CancellingRequestsCard;
