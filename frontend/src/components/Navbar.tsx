import { ModeToggle } from "./ModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
      <SidebarTrigger className="h-8 w-8" />
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </div>
  );
}

export default Navbar;
