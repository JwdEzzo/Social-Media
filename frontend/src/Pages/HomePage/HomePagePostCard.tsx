import { useGetPostCommentCountQuery } from "@/api/comments/commentApi";
import {
  useIsFollowedQuery,
  useToggleFollowMutation,
} from "@/api/followers/followApi";
import { postApi } from "@/api/posts/postApi";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} from "@/api/posts/postLikesApi";
import {
  useGetPostSaveCountQuery,
  useIsPostSavedQuery,
} from "@/api/posts/postSavesApi";
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
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { memo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface HomePagePostCardProps {
  post: GetPostResponseDto;
  onViewComments: (postId: number) => void;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
  handleToggleSavePost: (postId: number) => void;
  isTogglingSavePost: boolean;
}

const HomePagePostCard = memo(
  ({
    post,
    onViewComments,
    handleTogglePostLike,
    isTogglingPostLike,
    handleToggleSavePost,
    isTogglingSavePost,
  }: HomePagePostCardProps) => {
    const navigate = useNavigate();

    const { data: isPostLiked } = useIsPostLikedQuery(post?.id ?? 0, {
      skip: !post?.id || post.id === 0,
    });

    const { data: postLikeCount } = useGetPostLikeCountQuery(post?.id ?? 0, {
      skip: !post?.id || post.id === 0,
    });

    const { data: isPostSaved } = useIsPostSavedQuery(post?.id ?? 0, {
      skip: !post?.id || post.id === 0,
    });

    const { data: postSaveCount } = useGetPostSaveCountQuery(post?.id ?? 0, {
      skip: !post?.id || post.id === 0,
    });

    const { data: postCommentCount } = useGetPostCommentCountQuery(
      post?.id ?? 0,
      {
        skip: !post?.id || post.id === 0,
      },
    );

    const [toggleFollow, { isLoading: isTogglingFollow }] =
      useToggleFollowMutation();

    const { data: isFollowed } = useIsFollowedQuery(post.username);
    const dispatch = useDispatch();

    return (
      <div className="w-6/7 mx-auto">
        <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                  {/* Profile Picture with lazy loading */}
                  <img
                    src={post.profilePictureUrl}
                    alt={post.description}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    loading="lazy"
                    decoding="async"
                    onClick={() =>
                      navigate(`/searcheduserprofile/${post.username}`)
                    }
                  />
                  <h1
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/searcheduserprofile/${post.username}`)
                    }
                  >
                    {post.username}
                  </h1>
                  <Button
                    className={`ml-3 cursor-pointer ${
                      isFollowed
                        ? "fill-current text-white-500 dark:text-white-500 bg-black dark:bg-gray-900 text-white  hover:bg-red-700 dark:hover:bg-red-700 "
                        : "dark:hover:bg-gray-600 dark:hover:text-white bg-gray-300 hover:bg-gray-400  text-black"
                    }`}
                    onClick={() =>
                      toggleFollow(post.username)
                        .unwrap()
                        .then(() => {
                          dispatch(
                            postApi.util.invalidateTags([
                              { type: "Post", id: "FOLLOWING_POSTS" },
                            ]),
                          );
                        })
                    }
                    disabled={isTogglingPostLike || isTogglingFollow}
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </Button>
                </div>
                {/* <MoreHorizontal className="h-6 w-6 cursor-pointer" /> */}
              </div>
            </CardTitle>
            <CardDescription>
              <div className="h-fit">
                {/* Post image with lazy loading and async decoding */}
                <img
                  src={post.imageUrl}
                  alt={post.description}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full aspect-auto object-fit"
                  onDoubleClick={() => handleTogglePostLike(post.id)}
                />
              </div>
            </CardDescription>
            {/*  Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center pt-2">
                <Heart
                  className={`h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                    isPostLiked
                      ? "fill-current text-red-500 dark:text-red-500"
                      : ""
                  } ${isTogglingPostLike ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleTogglePostLike(post.id)}
                />
                <span className="text-gray-700 dark:text-gray-300 pl-1 pr-3">
                  {postLikeCount}
                </span>
                <MessageCircle
                  className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
                  onClick={() => onViewComments(post.id)}
                />
                <span className="text-gray-700 dark:text-gray-300 pl-1 pr-3">
                  {postCommentCount}
                </span>
                <Send className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-500 transition-colors" />
              </div>
              <div className="flex items-center ">
                <Bookmark
                  className={`h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 transition-colors ${
                    isPostSaved
                      ? "fill-current text-yellow-500 dark:text-yellow-500"
                      : ""
                  } ${isTogglingSavePost ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleToggleSavePost(post.id)}
                />
                <span className="text-gray-700 dark:text-gray-300 pl-1 pr-3">
                  {postSaveCount}
                </span>
              </div>
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
  },
  (prevProps, nextProps) => {
    // This function determines if the component should re-render
    // Return TRUE = skip re-render (props are the same)
    // Return FALSE = do re-render (props changed)

    // Check if the post itself changed
    // We only compare the post ID because the hooks inside will handle
    // fetching the latest like/save/comment counts
    const postUnchanged = prevProps.post.id === nextProps.post.id;

    // Check if the callback functions are the same reference
    // (they will be if you used useCallback in HomePage)
    const callbacksUnchanged =
      prevProps.onViewComments === nextProps.onViewComments &&
      prevProps.handleTogglePostLike === nextProps.handleTogglePostLike &&
      prevProps.handleToggleSavePost === nextProps.handleToggleSavePost;

    // Only re-render if the post ID changed or callbacks changed
    return postUnchanged && callbacksUnchanged;
  },
);

HomePagePostCard.displayName = "HomePagePostCard";

export default HomePagePostCard;
