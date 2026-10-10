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
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className="h-10 gap-3 font-medium transition-colors"
                  onClick={navigateBackToProfile}
                >
                  <User className="text-foreground" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem onClick={() => setSearchType("post")}>
                {isPostSearchOpen ? (
                  <div className="py-0.5">
                    <input
                      type="text"
                      placeholder="Search posts..."
                      className="h-10 w-full rounded-md border border-sidebar-border bg-muted px-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => handleSearchBlur("post")}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                ) : (
                  <SidebarMenuButton
                    className="h-10 gap-3 font-medium transition-colors"
                    onClick={() => setIsPostSearchOpen(true)}
                  >
                    <Search />
                    <span>Search Post</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem onClick={() => setSearchType("user")}>
                {isUserSearchOpen ? (
                  <div className="py-0.5">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="h-10 w-full rounded-md border border-sidebar-border bg-muted px-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => handleSearchBlur("user")}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                ) : (
                  <SidebarMenuButton
                    className="h-10 gap-3 font-medium transition-colors"
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
                  className="h-10 gap-3 font-medium transition-colors"
                >
                  <LogOutIcon className="text-destructive" />
                  <span className="text-destructive">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-10 gap-3 font-medium transition-colors">
                  <User2 />
                  <span className="truncate font-semibold">{username}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width) min-w-48 rounded-lg"
              >
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={navigateBackToProfile}
                >
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
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
