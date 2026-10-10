import {
  useDeletePostByPostIdMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import {
  useCreateCommentMutation,
  useEditCommentMutation,
  useGetCommentsByPostIdInfiniteQuery,
  useGetPostCommentCountQuery,
} from "@/api/comments/commentApi";
import { usePagedList } from "@/hooks/usePagedList";
import LoadMoreTrigger from "@/components/custom/load-more-trigger";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  RotateCcw,
  Share2,
  Trash2,
} from "lucide-react";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import CommentCard from "../CommentPages/CommentCard";
import "@/components/scrollbar.css";
import type { GetUserResponseDto } from "@/types/response-types";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} from "@/api/posts/postLikesApi";
import { useToggleCommentLikeMutation } from "@/api/comments/commentLikesApi";
import { useDispatch, useSelector } from "react-redux";
import {
  closePostModal,
  saveModalScrollPosition,
} from "@/slices/viewPostSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import {
  useCreateReplyMutation,
  useEditReplyMutation,
} from "@/api/comments/commentRepliesApi";
import {
  useGetPostSaveCountQuery,
  useIsPostSavedQuery,
} from "@/api/posts/postSavesApi";
import { useAuth } from "@/auth/useAuth";
import type { RootState } from "@/store/store";
import { enterReplyMode, resetReplyMode } from "@/slices/replyModeSlice";
import {
  closeEditMode,
  enterEditCommentMode,
  enterEditReplyMode,
} from "@/slices/editModeSlice";

interface ViewPostProps {
  isOpen: boolean;
  handleCloseViewModal: () => void;
  selectedPostId: number | null;
  loggedInUser: GetUserResponseDto | undefined;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
  handleToggleSavePost: (postId: number) => void;
  isTogglingSavePost: boolean;
}

function ViewPost({
  isOpen,
  handleCloseViewModal,
  selectedPostId,
  loggedInUser,
  handleTogglePostLike,
  isTogglingPostLike,
  handleToggleSavePost,
  isTogglingSavePost,
}: ViewPostProps) {
  const [newComment, setNewComment] = useState<string>("");
  const focusRef = useRef<HTMLInputElement>(null);

  const {
    isEditing,
    commentId: editCommentId,
    replyId: editReplyId,
    editType,
  } = useSelector((state: RootState) => state.editModeSlice);

  const {
    isReplying,
    commentId: replyCommentId,
    username: replyUsername,
  } = useSelector((state: RootState) => state.replyModeSlice);

  // Ref to track scroll position in the comments area
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalScrollPosition = useSelector(
    (state: RootState) => state.viewPostModal.modalScrollPosition,
  );

  // Redux actions
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username: loggedInUsername } = useAuth();
  const scrollPositionRef = useRef<number>(0);

  const [toggleCommentLike, { isLoading: isTogglingCommentLike }] =
    useToggleCommentLikeMutation();

  const [
    createComment,
    { isLoading: isCreateLoading, isError: isCreateError },
  ] = useCreateCommentMutation();

  const [createReply] = useCreateReplyMutation();
  const [editComment] = useEditCommentMutation();
  const [editReply] = useEditReplyMutation();

  // Fetch comments for the current post, a page at a time
  const commentsQuery = useGetCommentsByPostIdInfiniteQuery(
    { postId: selectedPostId! },
    { skip: !selectedPostId },
  );
  const {
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = commentsQuery;
  const {
    items: comments,
    loadMore: loadMoreComments,
    hasNextPage: hasMoreComments,
    isFetchingNextPage: isFetchingMoreComments,
  } = usePagedList(commentsQuery);

  // Fetch post details
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
  } = useGetPostByIdQuery(selectedPostId!);

  // Fetch post like status and count
  const { data: isPostLiked } = useIsPostLikedQuery(post?.id ?? 0, {
    skip: !post?.id || post.id === 0,
  });
  const { data: postLikeCount } = useGetPostLikeCountQuery(post?.id ?? 0, {
    skip: !post?.id || post.id === 0,
  });

  // Fetch comment count for the post
  const { data: postCommentCount } = useGetPostCommentCountQuery(
    post?.id ?? 0,
    {
      skip: !post?.id || post.id === 0,
    },
  );

  // Fetch save count and status for the post
  const { data: postSaveCount } = useGetPostSaveCountQuery(post?.id ?? 0, {
    skip: !post?.id || post.id === 0,
  });

  const { data: isPostSaved } = useIsPostSavedQuery(post?.id ?? 0, {
    skip: !post?.id || post.id === 0,
  });

  // Mutation for deleting the post
  const [deletePostById, { isLoading: isPostDeleting }] =
    useDeletePostByPostIdMutation();

  function navigateToSelectedUserProfile(username: string): void {
    // Save current modal scroll position before navigating
    if (scrollContainerRef.current) {
      dispatch(saveModalScrollPosition(scrollContainerRef.current.scrollTop));
    }

    if (loggedInUsername === username) {
      navigate(`/userprofile/${username}`, {
        state: { fromModal: true, previousPostId: selectedPostId },
      });
      dispatch(closePostModal({ preserveState: true }));
      window.scrollTo(0, 0);
    } else {
      navigate(`/searcheduserprofile/${username}`, {
        state: { fromModal: true, previousPostId: selectedPostId },
      });
      dispatch(closePostModal({ preserveState: true }));
      window.scrollTo(0, 0);
    }
  }

  // Restore modal scroll position when it opens
  useEffect(() => {
    if (isOpen && scrollContainerRef.current && modalScrollPosition > 0) {
      //  longer delay could be useful to ensure comments have rendered
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = modalScrollPosition;
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, modalScrollPosition, comments]);

  // Callback to toggle comment like status
  const handleToggleCommentLike = useCallback(
    async (commentId: number) => {
      try {
        await toggleCommentLike(commentId).unwrap();
      } catch (error) {
        console.log("Error: ", error);
      }
    },
    [toggleCommentLike],
  );

  // Callback to handle adding a new comment or reply
  const handleAddComment = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !selectedPostId) return;

      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop;
      }

      try {
        if (isReplying && replyCommentId) {
          await createReply({
            content: newComment,
            commentId: replyCommentId,
          }).unwrap();
          dispatch(resetReplyMode());
        } else if (!isReplying && !isEditing && selectedPostId) {
          await createComment({
            content: newComment,
            postId: selectedPostId,
          }).unwrap();
        } else if (isEditing && editType === "comment" && editCommentId) {
          await editComment({
            content: newComment,
            commentId: editCommentId,
          }).unwrap();
          dispatch(closeEditMode());
        } else if (isEditing && editType === "reply" && editReplyId) {
          await editReply({
            content: newComment,
            replyId: editReplyId,
          }).unwrap();
          dispatch(closeEditMode());
        }

        setNewComment("");
      } catch (error) {
        console.error("Failed to add comment/reply:", error);
      }
    },
    [
      newComment,
      selectedPostId,
      isReplying,
      replyCommentId,
      isEditing,
      editType,
      editCommentId,
      editReplyId,
      createReply,
      createComment,
      editComment,
      editReply,
      dispatch,
    ],
  );

  // Callback to enter reply mode for a specific comment
  const handleReplyToComment = useCallback(
    (commentId: number, username: string) => {
      // Always clear edit mode when entering reply mode
      if (isEditing) {
        dispatch(closeEditMode());
      }

      // Enter reply mode for the specified comment
      dispatch(enterReplyMode({ commentId, username }));

      // Clear the comment text field
      setNewComment("");
    },
    [dispatch, isEditing],
  );

  // Callback to enter edit mode for a specific comment
  const handleEditComment = useCallback(
    (commentId: number) => {
      // clear reply mode when entering edit mode
      if (isReplying) {
        dispatch(resetReplyMode());
      }

      // Enter edit mode for the specified comment
      dispatch(enterEditCommentMode(commentId));

      // clear the comment text field
      setNewComment("");
    },
    [dispatch, isReplying],
  );

  const handleEditReply = useCallback(
    (replyId: number) => {
      if (isReplying) dispatch(resetReplyMode());
      dispatch(enterEditReplyMode(replyId));
      setNewComment("");
    },
    [dispatch, isReplying],
  );

  // Callback to cancel reply mode
  const cancelReplyMode = useCallback(() => {
    dispatch(resetReplyMode());
    setNewComment("");
  }, [dispatch]);

  // callback to cancel edit mode
  const cancelEditMode = useCallback(() => {
    dispatch(closeEditMode());
    setNewComment("");
  }, [dispatch]);

  // Callback to handle post deletion
  const handleDeletePost = useCallback(async () => {
    if (post?.id) {
      try {
        await deletePostById(post.id).unwrap();
        dispatch(closePostModal());
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  }, [post?.id, deletePostById, dispatch]);

  if (!isOpen) return null;

  // Show loading screen if post data doesn't match selected post ID
  if (post?.id !== selectedPostId) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-8"
        onClick={handleCloseViewModal}
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-xl">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  // Show loading screen while post or comments are loading
  if (isPostLoading || isCommentsLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-8"
        onClick={handleCloseViewModal}
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-xl">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  // Show loading screen while post is being deleted
  if (isPostDeleting) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-8"
        onClick={handleCloseViewModal}
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-xl">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
          <p className="mt-4 text-sm text-muted-foreground">Deleting Post...</p>
        </div>
      </div>
    );
  }

  // Show error screen if there are errors loading post or comments
  if (isPostError || isCommentsError) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-8"
        onClick={handleCloseViewModal}
      >
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-xl">
          <h2 className="mb-2 text-center text-lg font-semibold text-destructive">
            Error Loading Content
          </h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            {isPostError ? "Failed to load post" : "Failed to load comments"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => {
                if (isPostError) refetchPost();
                if (isCommentsError) refetchComments();
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="size-4" /> Try Again
            </Button>
            <Button variant="outline" onClick={handleCloseViewModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-8"
      onClick={handleCloseViewModal}
    >
      <Card
        className="flex h-[88svh] w-full max-w-5xl flex-col gap-0 overflow-hidden rounded-lg border-0 bg-card py-0 shadow-2xl md:h-[85vh] md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Image Display */}
        <div className="flex h-[40%] w-full shrink-0 items-center justify-center bg-black md:h-full md:w-[55%]">
          <CardDescription className="size-full">
            <div className="size-full">
              <img
                src={post?.imageUrl}
                alt={post?.description}
                className="size-full object-contain"
                loading="lazy"
                decoding="async"
                onDoubleClick={() => handleTogglePostLike(post.id)}
              />
            </div>
          </CardDescription>
        </div>

        {/* Right Side - Content */}
        <div className="flex min-h-0 w-full flex-1 flex-col md:w-[45%]">
          {/* Top Header - Contains poster info and actions */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={post?.profilePictureUrl}
                alt={post?.description}
                className="size-8 cursor-pointer rounded-full object-cover ring-1 ring-border"
                loading="lazy"
                decoding="async"
                onClick={() => navigateToSelectedUserProfile(post?.username)}
              />
              <h1 className="cursor-pointer truncate text-sm font-semibold">
                {post?.username}
              </h1>
            </div>
            {/* Dropdown menu for post owner actions (edit/delete) */}
            {loggedInUser && loggedInUser.username === post?.username && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MoreHorizontal className="size-5 cursor-pointer text-foreground transition-opacity hover:opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-36 rounded-lg"
                  align="center"
                >
                  {/* Dropdown Content - Edit and Delete */}
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <div className="flex cursor-pointer items-center justify-between gap-3 pr-2">
                      <DropdownMenuItem
                        className="flex-1 cursor-pointer font-medium"
                        onClick={() =>
                          navigate(
                            `/userprofile/${post?.username}/post/edit/${post.id}`,
                          )
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <Edit className="size-4 text-muted-foreground" />
                    </div>
                    <div
                      className="flex cursor-pointer items-center justify-between gap-3 pr-2"
                      onClick={handleDeletePost}
                    >
                      <DropdownMenuItem className="flex-1 cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                        Delete
                      </DropdownMenuItem>
                      <Trash2 className="size-4 text-destructive/70" />
                    </div>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Scrollable Content Area - Contains post description and comments */}
          <div
            ref={scrollContainerRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
          >
            {/* Post Description Section */}
            <div className="mb-3 flex shrink-0 items-start gap-3">
              <div className="shrink-0">
                <img
                  src={post?.profilePictureUrl}
                  alt={post?.description}
                  className="size-8 cursor-pointer rounded-full object-cover ring-1 ring-border"
                  loading="lazy"
                  decoding="async"
                  onClick={() => navigateToSelectedUserProfile(post?.username)}
                />
              </div>
              <div>
                <div className="whitespace-pre-line break-words text-sm leading-snug">
                  {post?.description}
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground">
                  {post?.createdAt.substring(0, 10)}
                </div>
              </div>
            </div>

            <hr className="border-border" />
            {/* Comments List */}
            <div>
              {comments.map((comment) => (
                <CommentCard
                  postUsername={post.username}
                  key={`${comment.id}-${comment.content}`}
                  comment={comment}
                  handleToggleCommentLike={handleToggleCommentLike}
                  isTogglingCommentLike={isTogglingCommentLike}
                  onReply={handleReplyToComment}
                  navigateToSelectedUserProfile={navigateToSelectedUserProfile}
                  loggedInUser={loggedInUser}
                  onEditComment={handleEditComment}
                  onEditReply={handleEditReply}
                  focusRef={focusRef}
                />
              ))}
              <LoadMoreTrigger
                hasNextPage={hasMoreComments}
                isFetchingNextPage={isFetchingMoreComments}
                onLoadMore={loadMoreComments}
              />
            </div>
          </div>

          {/* Action Bar - Contains like, comment, share, and save buttons */}
          <div className="flex shrink-0 items-center gap-4 border-t border-border px-4 py-2.5">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Heart
                  className={`size-6 cursor-pointer text-foreground transition-[color,opacity,transform] hover:opacity-60 active:scale-90 ${
                    isPostLiked
                      ? "fill-current text-red-500 dark:text-red-500"
                      : ""
                  } ${
                    isTogglingPostLike ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleTogglePostLike(post?.id ?? 0)}
                />
                <span className="pr-2 text-sm font-semibold text-foreground">
                  {postLikeCount}
                </span>
                <MessageCircle
                  className="size-6 -scale-x-100 cursor-pointer text-foreground transition-opacity hover:opacity-60"
                  onClick={() => {
                    focusRef.current?.focus();
                  }}
                />
                <span className="pr-2 text-sm font-semibold text-foreground">
                  {postCommentCount}
                </span>
                <Share2 className="size-6 cursor-pointer text-foreground transition-opacity hover:opacity-60" />
              </div>
              <div className="flex items-center gap-1.5">
                <Bookmark
                  className={`size-6 cursor-pointer text-foreground transition-[opacity,transform] hover:opacity-60 active:scale-90 ${
                    isPostSaved ? "fill-current" : ""
                  } ${
                    isTogglingSavePost ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleToggleSavePost(post.id)}
                />
                <span className="pr-2 text-sm font-semibold text-foreground">
                  {postSaveCount}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Input Section - Contains input field and submit button */}
          <div className="shrink-0 border-t border-border px-4 py-3">
            {/* Reply indicator - shows who you're replying to */}
            {isReplying && !isEditing && (
              <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-1.5">
                <span className="text-xs text-muted-foreground">
                  Replying to{" "}
                  <span className="font-semibold text-foreground">
                    {replyUsername}
                  </span>
                </span>
                <button
                  onClick={cancelReplyMode}
                  className="rounded-sm text-xs font-semibold text-foreground hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Edit indicator - shows that youre editing the highlighted comment */}
            {isEditing && !isReplying && (
              <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-1.5">
                <span className="text-xs text-muted-foreground">
                  Editing...
                </span>
                <button
                  onClick={cancelEditMode}
                  className="rounded-sm text-xs font-semibold text-foreground hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Comment/Reply/Edit Form */}
            <form
              className="flex w-full items-center gap-3"
              onSubmit={handleAddComment}
            >
              <img
                src={loggedInUser?.profilePictureUrl}
                alt="Your profile"
                className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                loading="lazy"
                decoding="async"
              />
              <Input
                ref={focusRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isEditing
                    ? "Edit your comment..."
                    : isReplying
                      ? `Reply to ${replyUsername}...`
                      : "Add a comment..."
                }
                className="h-9 flex-1 rounded-full bg-muted/50 px-4"
              />
              <Button
                type="submit"
                variant="default"
                disabled={isCreateLoading}
                size="sm"
                className="rounded-full bg-transparent px-3 font-semibold text-sky-500 shadow-none hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
              >
                {isCreateLoading
                  ? isEditing
                    ? "Saving..."
                    : isReplying
                      ? "Replying..."
                      : "Posting..."
                  : isEditing
                    ? "Save"
                    : isReplying
                      ? "Reply"
                      : "Post"}
              </Button>
            </form>
            {isCreateError && (
              <p className="mt-2 text-xs text-destructive">
                Error posting comment
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ViewPost;
