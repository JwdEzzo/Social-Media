import { ChevronUp, LogOutIcon, Search, User, User2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/auth/authSlice";
import { useAuth } from "@/auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

function AppSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  function navigateBackToProfile() {
    navigate(`/userprofile/${username}`);
  }

  function handleSearch() {
    console.log("Search function called");
    console.log("Current search query:", searchQuery);

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      console.log("Navigating to search results");
      setIsOpen(false);
      setSearchQuery("");
    } else {
      console.log("Search query is empty, not navigating");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="dark:bg-gray-800 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="mt-3">
                <SidebarMenuButton
                  className="dark:hover:bg-gray-900 transition-colors"
                  onClick={navigateBackToProfile}
                  //
                >
                  <User />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                {isOpen ? (
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => {
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                ) : (
                  <SidebarMenuButton
                    className="dark:hover:bg-gray-900 transition-colors"
                    onClick={() => setIsOpen(true)}
                  >
                    <Search />
                    <span>Search</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="dark:hover:bg-gray-900 transition-colors"
                  //
                >
                  <LogOutIcon className="text-red-500" />
                  <span className="text-red-500">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="dark:bg-gray-800 bg-white dark:hover:bg-gray-900 transition-colors">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="dark:hover:bg-gray-900 transition-colors ">
                  <User2 /> <span className="font-bold">{username}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] dark:bg-gray-800 bg-white transition-colors"
              >
                <DropdownMenuItem
                  className=" dark:hover:bg-gray-700 transition-colors"
                  onClick={navigateBackToProfile}
                  //
                >
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className=" dark:hover:bg-gray-700 transition-colors"
                  onClick={handleLogout}
                  //
                >
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
export default AppSidebar;
