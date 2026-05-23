// const handleAddComment = useCallback(
//   async (e: FormEvent) => {
//     e.preventDefault();
//     if (!newComment.trim() || !selectedPostId) return;

//     // Save current scroll position
//     if (scrollContainerRef.current) {
//       scrollPositionRef.current = scrollContainerRef.current.scrollTop;
//     }

//     try {
//       if (isReplying && replyCommentId) {
//         // Create a reply to a comment
//         await createReply({
//           content: newComment,
//           commentId: replyCommentId,
//         }).unwrap();

//         // Reset reply mode after successful creation
//         dispatch(resetReplyMode());
//       } else if (!isReplying && !isEditing && selectedPostId) {
//         // Create a new comment
//         await createComment({
//           content: newComment,
//           postId: selectedPostId,
//         }).unwrap();
//       } else if (isEditing && editCommentId) {
//         // Edit an existing comment
//         await editComment({
//           content: newComment,
//           commentId: editCommentId,
//         }).unwrap();
//         // Reset edit mode after successful edit
//         dispatch(closeEditMode());
//       }
//       setNewComment("");
//     } catch (error) {
//       console.error("Failed to add comment/reply:", error);
//     }
//   },
//   [
//     newComment,
//     selectedPostId,
//     isReplying,
//     replyCommentId,
//     isEditing,
//     editCommentId,
//     createReply,
//     dispatch,
//     createComment,
//     editComment,
//   ],
// );
