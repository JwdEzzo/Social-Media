import {
  useEditPostWithUploadMutation,
  useGetPostByIdQuery,
} from "@/api/posts/postApi";
import type { EditPostWithUploadRequest } from "@/types/request-types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PostFormModal, { type PostFormData } from "./PostFormModal";

function EditPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams<{ postId: string }>();

  // Go back to wherever Edit was opened from. location.key is "default" when this
  // is the first page of the visit (link opened directly or page reloaded); going
  // back then would leave the app, so go to the profile instead.
  function handleClose() {
    if (location.key !== "default") navigate(-1);
    else navigate("/me");
  }
  const { data: post } = useGetPostByIdQuery(Number(postId), { skip: !postId });

  const [editPostWithUpload, { isLoading: isSubmitting }] =
    useEditPostWithUploadMutation();

  // No navigate and no catch here: PostFormModal calls handleClose once this
  // resolves, and shows the error itself if it rejects
  async function handleFormSubmit(data: PostFormData) {
    // No new file keeps the post's current image
    const editRequest: EditPostWithUploadRequest = {
      description: data.description,
      image: data.file,
    };

    await editPostWithUpload({
      ...editRequest,
      postId: parseInt(postId!),
    }).unwrap();
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
      handleClose={handleClose}
    />
  );
}

export default EditPost;
