import {
  useGetReplyLikeCountQuery,
  useIsReplyLikedQuery,
  useToggleReplyLikeMutation,
} from "@/api/comments/commentReplyLikesApi";
import { useAuth } from "@/auth/useAuth";
import { closePostModal } from "@/slices/viewPostSlice";
import type { GetReplyResponseDto } from "@/types/responseTypes";
import { Heart } from "lucide-react";
import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface ReplyCardProps {
  reply: GetReplyResponseDto;
}

const ReplyCard = memo(
  ({ reply }: ReplyCardProps) => {
    const [toggleReplyLike, { isLoading: isLikeToggling }] =
      useToggleReplyLikeMutation();

    const { data: replyLikeCount } = useGetReplyLikeCountQuery(reply?.id ?? 0, {
      skip: !reply?.id || reply.id === 0,
    });

    const { data: isReplyLiked } = useIsReplyLikedQuery(reply?.id ?? 0, {
      skip: !reply?.id || reply.id === 0,
    });

    const handleToggleLike = useCallback(() => {
      toggleReplyLike(reply.id);
    }, [toggleReplyLike, reply.id]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { username: loggedInUsername } = useAuth();

    function navigateToSelectedUserProfile(username: string): void {
      if (loggedInUsername === username) {
        navigate(`/userprofile/${username}`);
        dispatch(closePostModal());
      } else {
        navigate(`/searcheduserprofile/${username}`);
        dispatch(closePostModal());
      }
    }

    return (
      <div className="pt-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <img
            src={reply.appUser.profilePictureUrl}
            alt={reply.appUser.username}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
            decoding="async"
            onClick={() => {
              navigateToSelectedUserProfile(reply.appUser.username);
            }}
          />

          {/* Reply Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-[11px] dark:text-white font-sans"
                onClick={() => {
                  navigateToSelectedUserProfile(reply.appUser.username);
                }}
              >
                {reply.appUser.username}
              </span>
            </div>

            <div className="">
              <span className="text-sm dark:text-white break-words font-normal">
                {reply.content}
              </span>
            </div>

            {/* Reply Actions */}
            <div className="flex items-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden [@media(min-width:770px)]:block pr-2">
                {reply.createdAt.substring(0, 10)}
              </span>

              <Heart
                className={`h-4 w-4 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                  isReplyLiked
                    ? "fill-current text-red-500 dark:text-red-500"
                    : ""
                } ${isLikeToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleToggleLike}
              />
              <span className="text-gray-700 dark:text-gray-300 text-[13px] pl-1 pr-3 pb-[1px]">
                {replyLikeCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps: ReplyCardProps, nextProps: ReplyCardProps): boolean =>
    prevProps.reply.id === nextProps.reply.id,
);

ReplyCard.displayName = "ReplyCard";

export default ReplyCard;
