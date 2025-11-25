import {
  useEditPostWithUploadMutation,
  useEditPostWithUrlMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import type {
  EditPostWithUploadRequestDto,
  EditPostWithUrlRequestDto,
} from "@/types/requestTypes";
import { useNavigate, useParams } from "react-router-dom";
import PostFormModal, { type PostFormData } from "./PostFormModal";

function EditPost() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { data: post } = useGetPostByIdQuery(Number(postId), { skip: !postId });

  const [editPostWithUrl, { isLoading: isEditingUrl }] =
    useEditPostWithUrlMutation();
  const [editPostWithUpload, { isLoading: isEditingUpload }] =
    useEditPostWithUploadMutation();

  const isSubmitting = isEditingUrl || isEditingUpload;

  async function handleFormSubmit(data: PostFormData) {
    try {
      if (data.uploadMode === "url") {
        if (!data.imageUrl) {
          throw new Error("Image URL is required");
        }
        const editWithUrlRequest: EditPostWithUrlRequestDto = {
          description: data.description,
          imageUrl: data.imageUrl,
        };
        await editPostWithUrl({
          ...editWithUrlRequest,
          postId: parseInt(postId!),
        }).unwrap();
        navigate(`/userprofile/${post?.username}`);
      } else {
        if (!data.file) {
          throw new Error("File is required");
        }
        const editWithUploadRequest: EditPostWithUploadRequestDto = {
          description: data.description,
          image: data.file,
        };

        await editPostWithUpload({
          ...editWithUploadRequest,
          postId: parseInt(postId!),
        }).unwrap();
        navigate(`/userprofile/${post?.username}`);
      }
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
