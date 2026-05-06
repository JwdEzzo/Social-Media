import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import {
  useAcceptFollowRequestMutation,
  useDeclineFollowRequestMutation,
  useGetIncomingFollowRequestsCountQuery,
  useGetIncomingFollowRequestsQuery,
} from '@/api/followers/followApi';
import { Button } from '../ui/button';
import { useAuth } from '@/auth/useAuth';
import { useGetUserByUsernameQuery } from '@/api/users/userApi';

function FollowRequestCard() {
  const { username: loggedInUsername } = useAuth();
  const { data: loggedInUser } = useGetUserByUsernameQuery(loggedInUsername!, { skip: !loggedInUsername });

  const { data: followRequests } = useGetIncomingFollowRequestsQuery();

  const { data: requestCount } = useGetIncomingFollowRequestsCountQuery();

  const [acceptOneFollowRequest] = useAcceptFollowRequestMutation();
  const [declineOneFollowRequest] = useDeclineFollowRequestMutation();

  if (loggedInUser?.accountStatus !== 'PRIVATE') {
    return null;
  }

  if (followRequests?.length === 0) {
    <Card className="bg-white dark:bg-gray-800 mx-auto w-1/2">
      <CardTitle className="text-base font-semibold leading-tight tracking-tight">Follow Requests</CardTitle>
      <CardContent>
        <p className="text-sm text-muted-foreground">You have no follow requests</p>
      </CardContent>
    </Card>;
  }

  return (
    <div className=" mb-10">
      <Card className="bg-white dark:bg-gray-800 mx-auto w-1/2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold leading-tight tracking-tight">Follow Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {followRequests?.map((followRequest) => (
            <div key={followRequest.requestId} className="flex items-center justify-between">
              <div className="flex items-center justify-start py-2">
                <img
                  className="h-10 w-10 rounded-full"
                  src={followRequest.requesterProfilePictureUrl ?? ''}
                  alt={`${followRequest.requesterUsername} pic`}
                />
                <span className="px-3">{followRequest.requesterUsername}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-green-400 hover:bg-green-500"
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
                  className="bg-red-400 hover:bg-red-500"
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
          ))}
        </CardContent>
        <CardFooter>
          {requestCount === 0 && <span className="text-sm text-gray-400">You have no follow requests</span>}
        </CardFooter>
      </Card>
    </div>
  );
}

export default FollowRequestCard;
