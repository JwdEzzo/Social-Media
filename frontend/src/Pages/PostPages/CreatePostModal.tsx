import {
  postApi,
  useCreatePostMutation,
  useUploadPostMutation,
} from "@/api/posts/postApi";
import type { CreatePostRequestDto } from "@/types/requestTypes";
import { useDispatch } from "react-redux";
import PostFormModal, { type PostFormData } from "./PostFormModal";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [createPost, { isLoading: isCreatingPost }] = useCreatePostMutation();
  const [uploadPost, { isLoading: isUploadingPost }] = useUploadPostMutation();
  const dispatch = useDispatch();

  const isSubmitting = isCreatingPost || isUploadingPost;

  async function handleFormSubmit(data: PostFormData) {
    if (data.uploadMode === "url") {
      if (!data.imageUrl) {
        throw new Error("Image URL is required");
      }
      const postRequest: CreatePostRequestDto = {
        description: data.description,
        imageUrl: data.imageUrl,
      };
      await createPost(postRequest).unwrap();
      dispatch(postApi.util.invalidateTags([{ type: "Post", id: "COUNT" }]));
    } else {
      if (!data.file) {
        throw new Error("File is required");
      }
      await uploadPost({
        description: data.description,
        image: data.file,
      }).unwrap();
    }
  }

  function handleClose() {
    onClose();
  }

  if (!isOpen) return null;

  return (
    <PostFormModal
      isOpen={true}
      isSubmitting={isSubmitting}
      handleSubmit={handleFormSubmit}
      handleClose={handleClose}
      mode={"create"}
      title={"Create Post"}
    />
  );
}

export default CreatePostModal;
