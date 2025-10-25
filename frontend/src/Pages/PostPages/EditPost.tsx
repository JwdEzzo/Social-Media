import { useEditPostWithUrlMutation } from "@/api/posts/postApi";
import { useNavigate } from "react-router-dom";

type EditMode = "url" | "upload";

function EditPost() {
  const navigate = useNavigate();

  const [
    editPostWithUrl,
    { isLoading: isPostEditing, isError: isPostEditingError },
  ] = useEditPostWithUrlMutation();

  return <div>EditPost</div>;
}

export default EditPost;
