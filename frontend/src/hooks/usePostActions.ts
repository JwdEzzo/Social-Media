import { useTogglePostLikeMutation } from "@/api/posts/postLikesApi";
import { useTogglePostSaveMutation } from "@/api/posts/postSavesApi";

// Like / save toggles for a post. Call it in the component that renders the buttons
// (HomePagePostCard, ViewPostModal) rather than in the page, so:
// - pages don't have to pass these handlers down as props
// - each card gets its own isToggling state, instead of one shared across every card
// The mutations' invalidatesTags refresh the counts and the liked / saved tabs,
// so there's nothing to invalidate here.
export function usePostActions() {
  const [togglePostLike, { isLoading: isTogglingPostLike }] =
    useTogglePostLikeMutation();
  const [togglePostSave, { isLoading: isTogglingSavePost }] =
    useTogglePostSaveMutation();

  async function handleTogglePostLike(postId: number) {
    // Ignore clicks while the previous toggle is still in flight
    if (isTogglingPostLike) return;
    try {
      await togglePostLike(postId).unwrap();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }

  async function handleToggleSavePost(postId: number) {
    if (isTogglingSavePost) return;
    try {
      await togglePostSave(postId).unwrap();
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  }

  return {
    handleTogglePostLike,
    isTogglingPostLike,
    handleToggleSavePost,
    isTogglingSavePost,
  };
}
