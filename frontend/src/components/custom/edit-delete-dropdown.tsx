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
  entityType: "comment" | "reply";
  entityId: number;
  canEdit: boolean;
  canDelete: boolean;
  handleEntityEdit: (entityType: "comment" | "reply", entityId: number) => void;
  handleEntityDelete: (
    entityType: "comment" | "reply",
    entityId: number,
  ) => void;
}

function EditDeleteDropdown({
  entityType,
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
        <MoreHorizontal className="h-6 w-6 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-fit dark:bg-gray-900"
        align="center"
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          {canEdit && (
            <div className="flex items-center justify-start gap-7 cursor-pointer">
              <DropdownMenuItem
                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-600 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEntityEdit(entityType, entityId);
                }}
              >
                Edit
              </DropdownMenuItem>
              <Edit className="size-4 text-blue-200" />
            </div>
          )}
          {canDelete && (
            <div
              className="flex items-center justify-start cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleEntityDelete(entityType, entityId);
              }}
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
