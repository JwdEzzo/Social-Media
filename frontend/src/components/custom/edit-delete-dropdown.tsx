import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// The two permissions differ on the backend: only the author can edit, while the
// post owner (and, for replies, the comment owner) can also delete.
interface EditDeleteDropdownProps {
  canEdit: boolean;
  canDelete: boolean;
  entityId: number;
  handleEntityEdit: (entityId: number) => void;
  handleEntityDelete: () => void;
}

function EditDeleteDropdown({
  entityId,
  canEdit,
  canDelete,
  handleEntityDelete,
  handleEntityEdit,
}: EditDeleteDropdownProps) {
  // Don't render at all if the user can't do either action
  if (!canEdit && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreHorizontal className="size-5 cursor-pointer text-foreground transition-opacity hover:opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-36 rounded-lg" align="center">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          {canEdit && (
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
          {canDelete && (
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
