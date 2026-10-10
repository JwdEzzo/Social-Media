import { useGetPostCommentCountQuery } from "@/api/comments/commentApi";
import { postApi } from "@/api/posts/postApi";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} from "@/api/posts/postLikesApi";
import {
  useGetPostSaveCountQuery,
  useIsPostSavedQuery,
} from "@/api/posts/postSavesApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GetPostResponse } from "@/types/response-types";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { memo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import FollowButton from "@/components/custom/follow-button";

interface HomePagePostCardProps {
  post: GetPostResponse;
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
    const dispatch = useDispatch();

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

    return (
      <div className="w-full">
        <Card className="w-full gap-0 rounded-none border-x-0 border-t-0 border-border bg-background py-0 shadow-none sm:rounded-lg sm:border">
          <CardHeader className="gap-0 px-0">
            <CardTitle className="px-3 py-3 text-sm">
              <div className="flex items-center gap-3 justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                  {/* Profile Picture with lazy loading */}
                  <img
                    src={post.profilePictureUrl}
                    alt={post.description}
                    className="size-8 cursor-pointer rounded-full object-cover ring-1 ring-border"
                    loading="lazy"
                    decoding="async"
                    onClick={() =>
                      navigate(`/searcheduserprofile/${post.username}`)
                    }
                  />
                  <h1
                    className="cursor-pointer truncate text-sm font-semibold hover:opacity-70"
                    onClick={() =>
                      navigate(`/searcheduserprofile/${post.username}`)
                    }
                  >
                    {post.username}
                  </h1>
                  <FollowButton
                    username={post.username}
                    onFollowToggled={() =>
                      dispatch(
                        postApi.util.invalidateTags([
                          { type: "Post", id: "LIST" },
                        ]),
                      )
                    }
                  />
                </div>
                {/* <MoreHorizontal className="h-6 w-6 cursor-pointer" /> */}
              </div>
            </CardTitle>
            <CardDescription className="text-foreground">
              <div className="aspect-square w-full overflow-hidden bg-muted">
                {/* Post image with lazy loading and async decoding */}
                <img
                  src={post.imageUrl}
                  alt={post.description}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                  onDoubleClick={() => handleTogglePostLike(post.id)}
                />
              </div>
            </CardDescription>
            {/*  Post Actions */}
            <div className="flex items-center justify-between px-3 pt-3">
              <div className="flex items-center">
                <Heart
                  className={`size-6 cursor-pointer text-foreground transition-[color,opacity,transform] hover:opacity-60 active:scale-90 ${
                    isPostLiked
                      ? "fill-current text-red-500 dark:text-red-500"
                      : ""
                  } ${isTogglingPostLike ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleTogglePostLike(post.id)}
                />
                <span className="pr-3 pl-1.5 text-sm font-semibold text-foreground">
                  {postLikeCount}
                </span>
                <MessageCircle
                  className="size-6 -scale-x-100 cursor-pointer text-foreground transition-opacity hover:opacity-60"
                  onClick={() => onViewComments(post.id)}
                />
                <span className="pr-3 pl-1.5 text-sm font-semibold text-foreground">
                  {postCommentCount}
                </span>
                <Send className="size-6 cursor-pointer text-foreground transition-opacity hover:opacity-60" />
              </div>
              <div className="flex items-center">
                <Bookmark
                  className={`size-6 cursor-pointer text-foreground transition-[opacity,transform] hover:opacity-60 active:scale-90 ${
                    isPostSaved ? "fill-current" : ""
                  } ${isTogglingSavePost ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleToggleSavePost(post.id)}
                />
                <span className="pr-3 pl-1.5 text-sm font-semibold text-foreground">
                  {postSaveCount}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 pt-2 text-sm leading-snug">
            <div>
              <span className="font-semibold">{post.username} : </span>
              <span>{post.description}</span>
              <div
                className="mt-1.5 w-fit cursor-pointer text-muted-foreground hover:underline"
                onClick={() => onViewComments(post.id)}
              >
                View Comments...
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-3 pt-1.5 pb-4 text-xs tracking-wide text-muted-foreground">
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
