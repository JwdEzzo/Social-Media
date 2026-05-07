import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAcceptFollowRequestMutation,
  useDeclineFollowRequestMutation,
  useGetIncomingFollowRequestsCountQuery,
  useGetIncomingFollowRequestsQuery,
} from '@/api/followers/followApi';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/useAuth';
import { useGetUserByUsernameQuery } from '@/api/users/userApi';
import { useNavigate } from 'react-router-dom';

function IncomingRequestsCard() {
  const { username: loggedInUsername } = useAuth();
  const { data: loggedInUser } = useGetUserByUsernameQuery(loggedInUsername!, { skip: !loggedInUsername });

  const navigate = useNavigate();

  const { data: followRequests } = useGetIncomingFollowRequestsQuery();

  const { data: incomingRequestCount } = useGetIncomingFollowRequestsCountQuery();

  const [acceptOneFollowRequest] = useAcceptFollowRequestMutation();
  const [declineOneFollowRequest] = useDeclineFollowRequestMutation();

  if (loggedInUser?.accountStatus !== 'PRIVATE') {
    return null;
  }

  if (incomingRequestCount === 0) {
    return null;
  }

  return (
    <div className=" mb-10">
      <Card className="bg-white dark:bg-gray-800 mx-auto w-1/2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold leading-tight tracking-tight">Incoming Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {followRequests?.map((followRequest) => (
            <div>
              <div key={followRequest.requestId} className="flex items-center justify-between pb-1">
                <div className="flex items-center justify-start py-2 gap-1">
                  <img
                    className="h-10 w-10 rounded-full cursor-pointer"
                    src={followRequest.requesterProfilePictureUrl ?? ''}
                    alt={`${followRequest.requesterUsername} pic`}
                    onClick={() => navigate(`/searcheduserprofile/${followRequest.requesterUsername}`)}
                  />
                  <span className="mx-3">{followRequest.requesterUsername}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
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
              <div className="border-t border-gray-600" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default IncomingRequestsCard;
