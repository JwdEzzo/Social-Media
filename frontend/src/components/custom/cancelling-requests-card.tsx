import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useState } from 'react';
import {
  useCancelFollowRequestMutation,
  useGetAllOutgoingFollowRequestsQuery,
  useGetOutgoingFollowRequestsCountQuery,
} from '@/api/followers/followApi';
import { Button } from '../ui/button';

function CancellingRequestsCard() {
  const [isHovering, setIsHovering] = useState(false);

  const { data: outgoingRequests } = useGetAllOutgoingFollowRequestsQuery();

  const { data: outgoingRequestsCount } = useGetOutgoingFollowRequestsCountQuery();

  const [cancelFollowRequest] = useCancelFollowRequestMutation();

  if (outgoingRequests?.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <Card className="bg-white dark:bg-gray-800 mx-auto w-1/2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold leading-tight tracking-tight">Outgoing Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {outgoingRequests?.map((request) => (
            <div>
              <div key={request.requestId} className="flex items-center justify-between pb-1">
                <div className="flex items-center justify-start py-2">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={request.targetProfilePictureUrl ?? ''}
                    alt={`${request.targetUsername} pic`}
                  />
                  <span className="px-3">{request.targetUsername}</span>
                </div>
                {/* Cancel Request Button*/}
                <Button
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`bg-red-400 hover:bg-red-500 ${isHovering && 'bg-red-600'}`}
                  onClick={() =>
                    cancelFollowRequest({ requestId: request.requestId, requesterUsername: request.requesterUsername })
                  }
                >
                  Cancel
                </Button>
              </div>
              <div className="border-t border-gray-600" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          {outgoingRequestsCount === 0 && <span className="text-sm text-gray-400">You have no follow requests</span>}
        </CardFooter>
      </Card>
    </div>
  );
}

export default CancellingRequestsCard;
