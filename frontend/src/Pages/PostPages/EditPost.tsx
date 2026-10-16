import {
  useEditPostWithUploadMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import type { EditPostWithUploadRequest } from "@/types/request-types";
import { useNavigate, useParams } from "react-router-dom";
import PostFormModal, { type PostFormData } from "./PostFormModal";

function EditPost() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { data: post } = useGetPostByIdQuery(Number(postId), { skip: !postId });

  const [editPostWithUpload, { isLoading: isSubmitting }] =
    useEditPostWithUploadMutation();

  async function handleFormSubmit(data: PostFormData) {
    try {
      // No new file keeps the post's current image
      const editRequest: EditPostWithUploadRequest = {
        description: data.description,
        image: data.file,
      };

      await editPostWithUpload({
        ...editRequest,
        postId: parseInt(postId!),
      }).unwrap();
      navigate(`/userprofile/${post?.username}`);
    } catch (error) {
      console.error("Failed to edit post:", error);
    }
  }

  return (
    <PostFormModal
      isOpen={true}
      isSubmitting={isSubmitting}
      handleSubmit={handleFormSubmit}
      mode={"edit"}
      title={"Edit Post"}
      initialValues={{
        description: post?.description,
        imageUrl: post?.imageUrl,
      }}
      handleClose={function (): void {}}
    />
  );
}

export default EditPost;
