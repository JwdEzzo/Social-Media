import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface EditDeleteDropdownProps {
  isAuthenticated: boolean;
  entityId: number;
  handleEntityEdit: (entityId: number) => void;
  handleEntityDelete: () => void;
}
// Is Authenticated
// onEditComment
// handleDeleteComment
// onEditReply
// handleDeleteReply

function EditDeleteDropdown({
  entityId,
  isAuthenticated,
  handleEntityDelete,
  handleEntityEdit,
}: EditDeleteDropdownProps) {
  // Don't render at all if the user can't do either action
  if (!isAuthenticated) return null;

  return (
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
          {isAuthenticated && (
            <div className="flex items-center justify-start gap-7 cursor-pointer">
              <DropdownMenuItem
                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-600 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                onClick={() => handleEntityEdit(entityId)}
              >
                Edit
              </DropdownMenuItem>
              <Edit className="size-4 text-blue-200" />
            </div>
          )}
          {isAuthenticated && (
            <div
              className="flex items-center justify-start cursor-pointer"
              onClick={handleEntityDelete}
            >
              <DropdownMenuItem className="text-red-400 hover:text-red-600 dark:hover:text-red-600 cursor-pointer font-bold pr-[18px] hover:bg-gray-200 dark:hover:bg-gray-900">
                Delete
              </DropdownMenuItem>
              <Trash2 className="size-4 text-red-200" />
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EditDeleteDropdown;
