import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAcceptFollowRequestMutation,
  useDeclineFollowRequestMutation,
  useGetIncomingFollowRequestsCountQuery,
  useGetIncomingFollowRequestsInfiniteQuery,
} from "@/api/followers/followApi";
import { usePagedList } from "@/hooks/usePagedList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/useAuth";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useNavigate } from "react-router-dom";

function IncomingRequestsCard() {
  const { username: loggedInUsername } = useAuth();
  const { data: loggedInUser } = useGetUserByUsernameQuery(loggedInUsername!, {
    skip: !loggedInUsername,
  });

  const navigate = useNavigate();

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
    <div className="mx-auto mb-4 w-full max-w-lg">
      <Card className="w-full gap-4 rounded-xl border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Incoming Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followRequests.map((followRequest) => (
            <div key={followRequest.requestId}>
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    className="size-11 shrink-0 cursor-pointer rounded-full object-cover ring-1 ring-border"
                    src={followRequest.requesterProfilePictureUrl ?? ""}
                    alt={`${followRequest.requesterUsername} pic`}
                    onClick={() =>
                      navigate(
                        `/searcheduserprofile/${followRequest.requesterUsername}`,
                      )
                    }
                  />
                  <span className="truncate text-sm font-semibold">
                    {followRequest.requesterUsername}
                  </span>
                </div>
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
      </Card>
    </div>
  );
}

export default IncomingRequestsCard;
