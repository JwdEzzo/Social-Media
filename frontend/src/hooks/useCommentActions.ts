import { useToggleCommentLikeMutation } from "@/api/comments/commentLikesApi";

export function useCommentActions() {
  const [toggleCommentLike, { isLoading: isTogglingCommentLike }] =
    useToggleCommentLikeMutation();

  async function handleToggleCommentLike(commentId: number) {
    if (isTogglingCommentLike) return;
    try {
      await toggleCommentLike(commentId).unwrap();
    } catch (error) {
      console.log("Failed to toggle like", error);
    }
  }

  return {
    handleToggleCommentLike,
    isTogglingCommentLike,
  };
}
