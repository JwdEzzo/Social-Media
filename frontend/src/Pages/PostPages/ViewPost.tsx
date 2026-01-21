import {
  useDeletePostByPostIdMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import {
  useCreateCommentMutation,
  useEditCommentMutation,
  useGetCommentsByPostIdQuery,
  useGetPostCommentCountQuery,
} from "@/api/comments/commentApi";
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
import type { GetUserResponseDto } from "@/types/responseTypes";
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
import { useCreateReplyMutation } from "@/api/comments/commentRepliesApi";
import {
  useGetPostSaveCountQuery,
  useIsPostSavedQuery,
} from "@/api/posts/postSavesApi";
import { useAuth } from "@/auth/useAuth";
import type { RootState } from "@/store/store";
import { enterReplyMode, resetReplyMode } from "@/slices/replyModeSlice";
import { closeEditMode, enterEditMode } from "@/slices/editModeSlice";

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
  // const [replyMode, setReplyMode] = useState<{
  //   isReplying: boolean;
  //   commentId: number | null;
  //   username: string | null;
  // }>({
  //   isReplying: false,
  //   commentId: null,
  //   username: null,
  // });

  // const [editMode, setEditMode] = useState<{
  //   isEditing: boolean;
  //   commentId: number | null;
  // }>({
  //   isEditing: false,
  //   commentId: null,
  // });

  const { isEditing, commentId: editCommentId } = useSelector(
    (state: RootState) => state.editModeSlice,
  );

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

  const [
    createComment,
    { isLoading: isCreateLoading, isError: isCreateError },
  ] = useCreateCommentMutation();

  const [toggleCommentLike, { isLoading: isTogglingCommentLike }] =
    useToggleCommentLikeMutation();

  const [createReply] = useCreateReplyMutation();
  const [editComment] = useEditCommentMutation();

  // Fetch comments for the current post
  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useGetCommentsByPostIdQuery({ postId: selectedPostId! });

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

      // Save current scroll position
      if (scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop;
      }

      try {
        if (isReplying && replyCommentId) {
          // Create a reply to a comment
          await createReply({
            content: newComment,
            commentId: replyCommentId,
          }).unwrap();

          // Reset reply mode after successful creation
          dispatch(resetReplyMode());
        } else if (!isReplying && !isEditing && selectedPostId) {
          // Create a new comment
          await createComment({
            content: newComment,
            postId: selectedPostId,
          }).unwrap();
        } else if (isEditing && editCommentId) {
          // Edit an existing comment
          await editComment({
            content: newComment,
            commentId: editCommentId,
          }).unwrap();
          // Reset edit mode after successful edit
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
      editCommentId,
      createReply,
      dispatch,
      createComment,
      editComment,
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
      dispatch(enterEditMode(commentId));

      // clear the comment text field
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

  useEffect(() => {
    console.log("Comments updated:", comments);
  }, [comments]);

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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleCloseViewModal}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading post...
          </p>
        </div>
      </div>
    );
  }

  // Show loading screen while post or comments are loading
  if (isPostLoading || isCommentsLoading) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleCloseViewModal}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading post...
          </p>
        </div>
      </div>
    );
  }

  // Show loading screen while post is being deleted
  if (isPostDeleting) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleCloseViewModal}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Deleting Post...
          </p>
        </div>
      </div>
    );
  }

  // Show error screen if there are errors loading post or comments
  if (isPostError || isCommentsError) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleCloseViewModal}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-500 mb-4 text-center">
            Error Loading Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            {isPostError ? "Failed to load post" : "Failed to load comments"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => {
                if (isPostError) refetchPost();
                if (isCommentsError) refetchComments();
              }}
              className="flex items-center"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleCloseViewModal}
    >
      <Card
        className="flex flex-row w-3/4 max-w-4xl h-[80vh] overflow-hidden bg-white dark:bg-gray-800 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Image Display */}
        <div className="w-1/2 flex-shrink-0">
          <CardDescription className="h-full w-full">
            <div className="h-full w-full">
              <img
                src={post?.imageUrl}
                alt={post?.description}
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
                onDoubleClick={() => handleTogglePostLike(post.id)}
              />
            </div>
          </CardDescription>
        </div>

        {/* Right Side - Content */}
        <div className="w-1/2 flex flex-col">
          {/* Top Header - Contains poster info and actions */}
          <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <img
                src={post?.profilePictureUrl}
                alt={post?.description}
                className="w-10 h-10 rounded-full cursor-pointer"
                loading="lazy"
                decoding="async"
                onClick={() => navigateToSelectedUserProfile(post?.username)}
              />
              <h1 className="font-bold cursor-pointer">{post?.username}</h1>
            </div>
            {/* Dropdown menu for post owner actions (edit/delete) */}
            {loggedInUser && loggedInUser.username === post?.username && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MoreHorizontal className="h-6 w-6 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-fit dark:bg-gray-900"
                  align="center"
                >
                  {/* Dropdown Content - Edit and Delete */}
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <div className="flex items-center justify-start gap-7 cursor-pointer">
                      <DropdownMenuItem
                        className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-600 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                        onClick={() =>
                          navigate(
                            `/userprofile/${post?.username}/post/edit/${post.id}`,
                          )
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <Edit className="size-4 text-blue-200" />
                    </div>
                    <div
                      className="flex items-center justify-start cursor-pointer"
                      onClick={handleDeletePost}
                    >
                      <DropdownMenuItem className="text-red-400 hover:text-red-600 dark:hover:text-red-600 cursor-pointer font-bold pr-[18px] hover:bg-gray-200 dark:hover:bg-gray-900">
                        Delete
                      </DropdownMenuItem>
                      <Trash2 className="size-4 text-red-200" />
                    </div>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Scrollable Content Area - Contains post description and comments */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
            {/* Post Description Section */}
            <div className="mb-2 flex items-start gap-1 flex-shrink-0">
              <div className="flex-shrink-0">
                <img
                  src={post?.profilePictureUrl}
                  alt={post?.description}
                  className="w-8 h-8 rounded-full object-fill cursor-pointer"
                  loading="lazy"
                  decoding="async"
                  onClick={() => navigateToSelectedUserProfile(post?.username)}
                />
              </div>
              <div>
                <div className="font-normal text-sm">{post?.description}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  {post?.createdAt.substring(0, 10)}
                </div>
              </div>
            </div>

            <hr className="border-gray-300 dark:border-gray-700" />
            {/* Comments List */}
            <div>
              {comments?.map((comment) => (
                <CommentCard
                  postUsername={post.username}
                  key={`${comment.id}-${comment.content}`}
                  comment={comment}
                  handleToggleCommentLike={handleToggleCommentLike}
                  isTogglingCommentLike={isTogglingCommentLike}
                  onReply={handleReplyToComment}
                  navigateToSelectedUserProfile={navigateToSelectedUserProfile}
                  loggedInUser={loggedInUser}
                  onEdit={handleEditComment}
                />
              ))}
            </div>
          </div>

          {/* Action Bar - Contains like, comment, share, and save buttons */}
          <div className="flex items-center gap-4 px-4 py-3 border-t flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <Heart
                  className={`h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                    isPostLiked
                      ? "fill-current text-red-500 dark:text-red-500"
                      : ""
                  } ${
                    isTogglingPostLike ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleTogglePostLike(post?.id ?? 0)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {postLikeCount}
                </span>
                <MessageCircle className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {postCommentCount}
                </span>
                <Share2 className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-500 transition-colors" />
              </div>
              <div className="flex items-center">
                <Bookmark
                  className={`h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-500 transition-colors ${
                    isPostSaved
                      ? "fill-current text-yellow-500 dark:text-yellow-500"
                      : ""
                  } ${
                    isTogglingSavePost ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleToggleSavePost(post.id)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {postSaveCount}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Input Section - Contains input field and submit button */}
          <div className="p-4 border-t flex-shrink-0">
            {/* Reply indicator - shows who you're replying to */}
            {isReplying && !isEditing && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Replying to <span className="font-bold">{replyUsername}</span>
                </span>
                <button
                  onClick={cancelReplyMode}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Edit indicator - shows that youre editing the highlighted comment */}
            {isEditing && !isReplying && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Editing...
                </span>
                <button
                  onClick={cancelEditMode}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Comment/Reply/Edit Form */}
            <form className="flex w-full gap-2" onSubmit={handleAddComment}>
              <img
                src={loggedInUser?.profilePictureUrl}
                alt="Your profile"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isEditing
                    ? "Edit your comment..."
                    : isReplying
                      ? `Reply to ${replyUsername}...`
                      : "Add a comment..."
                }
                className="flex-1"
              />
              <Button
                type="submit"
                variant="default"
                disabled={isCreateLoading}
                size="sm"
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
              <p className="text-red-500 text-sm mt-2">Error posting comment</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ViewPost;
