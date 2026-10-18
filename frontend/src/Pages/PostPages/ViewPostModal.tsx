import {
  useDeletePostByPostIdMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import {
  useCreateCommentMutation,
  useEditCommentMutation,
  useGetCommentsByPostIdInfiniteQuery,
} from "@/api/comments/commentApi";
import { usePagedList } from "@/hooks/usePagedList";
import { usePostActions } from "@/hooks/usePostActions";
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
import CommentCard from "@/Pages/CommentPages/CommentCard";
import ViewPostLikesModal from "@/Pages/PostPages/ViewPostLikesModal";
import "@/components/css/scrollbar.css";
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
import { useNavigateToProfile } from "@/hooks/useNavigateToProfile";
import type { RootState } from "@/store/store";
import { enterReplyMode, resetReplyMode } from "@/slices/replyModeSlice";
import {
  closeEditMode,
  enterEditCommentMode,
  enterEditReplyMode,
} from "@/slices/editModeSlice";
import UserAvatar from "@/components/custom/user-avatar";
import { usePostStats } from "@/hooks/usePostStats";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Spinner from "@/components/custom/spinner";
import { StatusCard } from "@/components/custom/status-card";
import { formatDate } from "@/utils/helpers";

// The post viewer opened from a post tile or "View Comments". Whether it's open and
// which post it shows live in the viewPostModal slice (openPostModal / closePostModal),
// so a page only needs to render <ViewPostModal /> once and dispatch openPostModal.
function ViewPostModal() {
  //
  const { isOpen, selectedPostId, modalScrollPosition } = useSelector(
    (state: RootState) => state.viewPostModal,
  );
  const { loggedInUser, isMe } = useCurrentUser();

  const {
    handleTogglePostLike,
    isTogglingPostLike,
    handleToggleSavePost,
    isTogglingSavePost,
  } = usePostActions();

  const [newComment, setNewComment] = useState<string>("");
  const focusRef = useRef<HTMLInputElement>(null);
  const [isLikesOpen, setIsLikesOpen] = useState<boolean>(false);

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

  // Redux actions
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navigateToProfile = useNavigateToProfile();
  const scrollPositionRef = useRef<number>(0);

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
  } = useGetPostByIdQuery(selectedPostId ?? skipToken);

  const {
    postSaveCount,
    postCommentCount,
    postLikeCount,
    isPostLiked,
    isPostSaved,
  } = usePostStats(post?.id);

  // Mutation for deleting the post
  const [deletePostById, { isLoading: isPostDeleting }] =
    useDeletePostByPostIdMutation();

  function handleCloseViewModal(): void {
    dispatch(closePostModal());
  }

  // Lock page scrolling behind the modal while it's open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  function navigateToSelectedUserProfile(username: string): void {
    // Save current modal scroll position before navigating
    if (scrollContainerRef.current) {
      dispatch(saveModalScrollPosition(scrollContainerRef.current.scrollTop));
    }

    navigateToProfile(username, {
      state: { fromModal: true, previousPostId: selectedPostId },
    });
    dispatch(closePostModal({ preserveState: true }));
    window.scrollTo(0, 0);
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

  // Post data matches the selected post ID and nothing is still loading
  const isPostReady =
    post?.id === selectedPostId && !isPostLoading && !isCommentsLoading;

  // Show loading screen while the post loads, or while it's being deleted
  if (!isPostReady || isPostDeleting) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 md:p-8"
        onClick={handleCloseViewModal}
      >
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 shadow-xl">
          <Spinner className="mx-auto size-8" />
          <p className="mt-4 text-sm text-muted-foreground">
            {isPostReady ? "Deleting Post..." : "Loading post..."}
          </p>
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
        <StatusCard
          className="max-w-md shadow-xl"
          isError
          title="Error Loading Content"
          message={
            isPostError ? "Failed to load post" : "Failed to load comments"
          }
          onRetry={() => {
            if (isPostError) refetchPost();
            if (isCommentsError) refetchComments();
          }}
        >
          <Button variant="outline" onClick={handleCloseViewModal}>
            Close
          </Button>
        </StatusCard>
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
              <UserAvatar
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
            {isMe(post?.username) && (
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
                        onClick={() => navigate(`/me/posts/${post.id}/edit`)}
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
                <UserAvatar
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
                  {formatDate(post.createdAt)}
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
                  onReply={handleReplyToComment}
                  navigateToSelectedUserProfile={navigateToSelectedUserProfile}
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
                <span
                  className="cursor-pointer pr-2 text-sm font-semibold text-foreground hover:opacity-60"
                  onClick={() => setIsLikesOpen(true)}
                >
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
              <UserAvatar
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

        {/* Inside the Card so its stopPropagation keeps clicks in the likes list from
            reaching the overlay and closing this modal */}
        <ViewPostLikesModal
          isOpen={isLikesOpen}
          onClose={() => setIsLikesOpen(false)}
          postId={post?.id ?? 0}
          navigateToSelectedUserProfile={navigateToSelectedUserProfile}
        />
      </Card>
    </div>
  );
}

export default ViewPostModal;
