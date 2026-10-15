import { useUploadPostMutation } from "@/api/posts/postApi";
import PostFormModal, { type PostFormData } from "./PostFormModal";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [uploadPost, { isLoading: isSubmitting }] = useUploadPostMutation();

  async function handleFormSubmit(data: PostFormData) {
    if (!data.file) {
      throw new Error("File is required");
    }
    await uploadPost({
      description: data.description,
      image: data.file,
    }).unwrap();
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
