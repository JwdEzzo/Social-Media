import {
  postApi,
  useDeletePostByPostIdMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import {
  useCreateCommentMutation,
  useGetCommentsByPostIdQuery,
  useGetPostCommentCountQuery,
} from "@/api/comments/commentApi";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Heart,
  MessageCircle,
  MoreHorizontal,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import CommentCard from "../CommentPages/CommentCard";
import "@/components/scrollbar.css";
import type { GetUserResponseDto } from "@/types/responseTypes";
import {
  useGetPostLikeCountQuery,
  useIsPostLikedQuery,
} from "@/api/posts/postLikesApi";
import { useToggleCommentLikeMutation } from "@/api/comments/commentLikesApi";
import { useDispatch } from "react-redux";
import { closePostModal } from "@/slices/viewPostSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import EditPost from "./EditPost";

interface ViewPostProps {
  isOpen: boolean;
  handleCloseViewModal: () => void;
  selectedPostId: number | null;
  loggedInUser: GetUserResponseDto | undefined;
  handleTogglePostLike: (postId: number) => void;
  isTogglingPostLike: boolean;
}

function ViewPost({
  isOpen,
  handleCloseViewModal,
  selectedPostId,
  loggedInUser,
  handleTogglePostLike,
  isTogglingPostLike,
}: ViewPostProps) {
  const [newComment, setNewComment] = useState<string>("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useGetCommentsByPostIdQuery({ postId: selectedPostId! });

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    refetch: refetchPost,
  } = useGetPostByIdQuery(selectedPostId!);

  const [
    createComment,
    { isLoading: isCreateLoading, isError: isCreateError },
  ] = useCreateCommentMutation();

  const [toggleCommentLike, { isLoading: isTogglingCommentLike }] =
    useToggleCommentLikeMutation();

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

  const [deletePostById, { isLoading: isPostDeleting }] =
    useDeletePostByPostIdMutation();

  async function handleToggleCommentLike(commentId: number) {
    try {
      await toggleCommentLike(commentId).unwrap();
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !selectedPostId) return;

    try {
      await createComment({
        content: newComment,
        postId: selectedPostId,
      }).unwrap();
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }

  async function handleDeletePost(postId: number) {
    if (post?.id) {
      try {
        await deletePostById(post.id).unwrap(); // unwrap() helps catch errors
        // Close the modal only after successful deletion
        dispatch(closePostModal()); // Dispatrch tghe closePostModal action
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  }

  if (!isOpen) return null;

  // Don't render the post content until the data matches the selected post ID
  // Since we are changing views between posts, the old post data from the cache is still present in POST and COMMENTS variables , all whilst the new query is being fetched.
  // By doing this, we stop the rendering of the post until the data has been properly fetched and replaced the old one.
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
        {/* Image section - Left side*/}
        <div className="w-1/2 flex-shrink-0">
          <CardDescription className="h-full w-full">
            <div className="h-full w-full">
              <img
                src={post?.imageUrl}
                alt={post?.description}
                className="w-full h-full object-contain"
              />
            </div>
          </CardDescription>
        </div>

        {/* Comment section - Right side */}
        <div className="w-1/2 flex flex-col">
          {/* Poster - Fixed at top */}
          <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <img
                src={post?.profilePictureUrl}
                alt={post?.description}
                className="w-10 h-10 rounded-full"
              />
              <h1 className="font-bold">{post?.username}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <MoreHorizontal className="h-6 w-6 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-fit dark:bg-gray-900"
                align="center"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <div className="flex items-center justify-start gap-7 cursor-pointer ">
                    <DropdownMenuItem
                      className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-600 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                      onClick={() =>
                        navigate(
                          `/userprofile/${post?.username}/post/edit/${post.id}`
                        )
                      }
                    >
                      Edit
                    </DropdownMenuItem>
                    <Edit className="size-4 text-blue-200" />
                  </div>
                  <div
                    className="flex items-center justify-start cursor-pointer"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <DropdownMenuItem className="text-red-400 hover:text-red-600 dark:hover:text-red-600 cursor-pointer font-bold pr-[18px] hover:bg-gray-200 dark:hover:bg-gray-900">
                      Delete
                    </DropdownMenuItem>
                    <Trash2 className="size-4 text-red-200" />
                  </div>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Post description */}
            <div className="mb-4 flex items-start gap-1 flex-shrink-0">
              <div className="flex-shrink-0">
                {" "}
                {/* Add this class */}
                <img
                  src={post?.profilePictureUrl}
                  alt={post?.description}
                  className="w-8 h-8 rounded-full object-fill"
                />
              </div>
              <div>
                <div className="font-normal">{post?.description}</div>
                <div className="text-sm  text-gray-500 dark:text-gray-400 mt-1">
                  {post?.createdAt.substring(0, 10)}
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-300 dark:border-gray-700" />

            {/* Comments */}
            <div className="space-y-3">
              {comments?.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  handleToggleCommentLike={handleToggleCommentLike}
                  isTogglingCommentLike={isTogglingCommentLike}
                  //
                />
              ))}
            </div>
          </div>

          {/* Like/Comment/Share icons - Fixed above input */}
          <div className="flex items-center gap-4 px-4 py-3 border-t flex-shrink-0">
            <div className="flex items-center gap-1">
              <Heart
                className={`h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors ${
                  isPostLiked
                    ? "fill-current text-red-500 dark:text-red-500"
                    : ""
                } ${isTogglingPostLike ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  handleTogglePostLike(post?.id ?? 0);
                  dispatch(
                    postApi.util.invalidateTags([{ type: "Post", id: "LIST" }])
                  );
                }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {postLikeCount}
              </span>
              <MessageCircle className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-500 transition-colors" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {postCommentCount}
              </span>
              <Send className="h-6 w-6 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-500 transition-colors" />
            </div>
          </div>

          {/* Comment input - Fixed at bottom */}
          <div className="p-4 border-t flex-shrink-0">
            <form className="flex w-full gap-2" onSubmit={handleAddComment}>
              <img
                src={loggedInUser?.profilePictureUrl}
                alt="Your profile"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button
                type="submit"
                variant="default"
                disabled={isCreateLoading}
                size="sm"
              >
                {isCreateLoading ? "Posting..." : "Post"}
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
