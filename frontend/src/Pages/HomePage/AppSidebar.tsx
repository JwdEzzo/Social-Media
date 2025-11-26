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

type SearchType = "post" | "user";

function AppSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useAuth();

  const [searchType, setSearchType] = useState<SearchType>();
  const [isPostSearchOpen, setIsPostSearchOpen] = useState<boolean>(false);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  function navigateBackToProfile() {
    navigate(`/userprofile/${username}`);
  }

  function handlePostSearch() {
    if (searchType === "post" && searchQuery.trim()) {
      navigate(`/search/posts?q=${encodeURIComponent(searchQuery)}`);
      setIsPostSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleUserSearch() {
    if (searchType === "user" && searchQuery.trim()) {
      navigate(`/search/users?q=${encodeURIComponent(searchQuery)}`);
      setIsUserSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (searchType === "post") {
        handlePostSearch();
      } else if (searchType === "user") {
        handleUserSearch();
      }
    }
  }

  function handleSearchBlur(searchType: SearchType) {
    if (searchType === "post") {
      setIsPostSearchOpen(false);
    } else if (searchType === "user") {
      setIsUserSearchOpen(false);
    }
    setSearchQuery("");
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
                >
                  <User />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem onClick={() => setSearchType("post")}>
                {isPostSearchOpen ? (
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Search posts..."
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => handleSearchBlur("post")}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                ) : (
                  <SidebarMenuButton
                    className="dark:hover:bg-gray-900 transition-colors"
                    onClick={() => setIsPostSearchOpen(true)}
                  >
                    <Search />
                    <span>Search Post</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem onClick={() => setSearchType("user")}>
                {isUserSearchOpen ? (
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => handleSearchBlur("user")}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                ) : (
                  <SidebarMenuButton
                    className="dark:hover:bg-gray-900 transition-colors"
                    onClick={() => setIsUserSearchOpen(true)}
                  >
                    <Search />
                    <span>Search User</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="dark:hover:bg-gray-900 transition-colors"
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
                <SidebarMenuButton className="dark:hover:bg-gray-900 transition-colors">
                  <User2 />
                  <span className="font-bold">{username}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] dark:bg-gray-800 bg-white transition-colors"
              >
                <DropdownMenuItem
                  className="dark:hover:bg-gray-700 transition-colors"
                  onClick={navigateBackToProfile}
                >
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="dark:hover:bg-gray-700 transition-colors"
                  onClick={handleLogout}
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
