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
        <MoreHorizontal className="size-5 cursor-pointer text-foreground transition-opacity hover:opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-36 rounded-lg" align="center">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          {isAuthenticated && (
            <div className="flex cursor-pointer items-center justify-between gap-3 pr-2">
              <DropdownMenuItem
                className="flex-1 cursor-pointer font-medium"
                onClick={() => handleEntityEdit(entityId)}
              >
                Edit
              </DropdownMenuItem>
              <Edit className="size-4 text-muted-foreground" />
            </div>
          )}
          {isAuthenticated && (
            <div
              className="flex cursor-pointer items-center justify-between gap-3 pr-2"
              onClick={handleEntityDelete}
            >
              <DropdownMenuItem className="flex-1 cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                Delete
              </DropdownMenuItem>
              <Trash2 className="size-4 text-destructive/70" />
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EditDeleteDropdown;
