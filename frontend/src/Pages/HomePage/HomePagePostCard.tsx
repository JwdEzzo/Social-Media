import { useGetPostCommentCountQuery } from "@/api/comments/commentApi";
import {
  followerApi,
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followerApi";
import { postApi } from "@/api/posts/postApi";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} from "@/api/posts/postLikesApi";
import { userApi } from "@/api/users/userApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GetPostResponseDto } from "@/types/responseTypes";
import { Heart, MessageCircle, MoreHorizontal, Plus, Send } from "lucide-react";
import { useDispatch } from "react-redux";

interface HomePagePostCardProps {
  post: GetPostResponseDto;
  onViewComments: (postId: number) => void;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
}

function HomePagePostCard({
  post,
  onViewComments,
  handleTogglePostLike,
  isTogglingPostLike,
}: HomePagePostCardProps) {
  //
  const { data: isPostLiked } = useIsPostLikedQuery(post?.id ?? 0, {
    skip: !post?.id || post.id === 0,
  });

  const { data: postLikeCount } = useGetPostLikeCountQuery(post?.id ?? 0, {
    skip: !post?.id || post.id === 0,
  });

  const { data: postCommentCount } = useGetPostCommentCountQuery(
    post?.id ?? 0,
    {
      skip: !post?.id || post.id === 0,
    }
  );

  const [toggleFollow, { isLoading: isTogglingFollow }] =
    useToggleFollowMutation();

  const { data: isFollowed } = useIsFollowedQuery(post.username);
  const dispatch = useDispatch();

  return (
    <div className="w-full">
      <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                {/* Profile Picture */}
                <img
                  src={post.profilePictureUrl}
                  alt={post.description}
                  className="w-10 h-10 rounded-full"
                />
                <h1>{post.username}</h1>
                <Button
                  className={`ml-3 cursor-pointer ${
                    isFollowed
                      ? "fill-current text-white-500 dark:text-white-500 bg-black dark:bg-gray-900 text-white hover:bg-red-700 dark:hover:bg-red-700 "
                      : "dark:hover:bg-gray-600 dark:hover:text-white"
                  }`}
                  onClick={() => toggleFollow(post.username)}
                  disabled={isTogglingPostLike || isTogglingFollow}
                >
                  {isFollowed ? "Following" : "Follow"}
                </Button>
              </div>
              <MoreHorizontal className="h-6 w-6 cursor-pointer" />
            </div>
          </CardTitle>
          <CardDescription>
            <div className="h-fit">
              <img
                src={post.imageUrl}
                alt={post.description}
                className="w-full aspect-square object-cover"
              />
            </div>
          </CardDescription>
          {/*  Post Actions */}
          <div className="flex items-center pt-2">
            <Heart
              className={`h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                isPostLiked ? "fill-current text-red-500 dark:text-red-500" : ""
              } ${isTogglingPostLike ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => {
                handleTogglePostLike(post.id);
                dispatch(
                  postApi.util.invalidateTags([{ type: "Post", id: "LIST" }])
                );
              }}
            />
            <span className="text-gray-700 dark:text-gray-300 pl-1 pr-3">
              {postLikeCount}
            </span>
            <MessageCircle
              className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
              onClick={() => onViewComments(post.id)}
              //
            />
            <span className="text-gray-700 dark:text-gray-300 pl-1 pr-3">
              {postCommentCount}
            </span>
            <Send className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-500 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <span className="font-bold ">{post.username} : </span>
            <span>{post.description}</span>
            <div
              className="hover:underline cursor-pointer text-gray-400 dark:text-gray-400 mt-1"
              onClick={() => onViewComments(post.id)}
            >
              View Comments...
            </div>
          </div>
        </CardContent>
        <CardFooter className="font-serif">
          {post.createdAt.substring(0, 10)}
        </CardFooter>
      </Card>
    </div>
  );
}

export default HomePagePostCard;
