import {
  ChevronUp,
  Home,
  Instagram,
  Menu,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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
import { useGetUserByUsernameQuery } from "@/api/users/userApi";

type SearchType = "post" | "user";

const navButtonClass =
  "h-10 cursor-pointer gap-3 font-medium transition-colors group-data-[collapsible=icon]:my-1 group-data-[collapsible=icon]:p-1!";

function AppSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useAuth();
  const { data: loggedInUser } = useGetUserByUsernameQuery(username!);

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
      {/* Sidebar Header */}
      <SidebarHeader className="flex items-start px-2 py-1">
        <button
          type="button"
          aria-label="Home"
          className="cursor-pointer rounded-md p-2 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:my-1 group-data-[collapsible=icon]:p-1"
          onClick={navigateBackToProfile}
        >
          <Instagram className="size-6" />
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="my-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* User Icon */}
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateBackToProfile}
                >
                  <div>
                    <Home />
                  </div>
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Search Icon 1 */}
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
                    className={navButtonClass}
                    onClick={() => setIsPostSearchOpen(true)}
                  >
                    <div>
                      <Search />
                    </div>
                    <span>Search Post</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              {/* Search Icon 2 */}
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
                    className={navButtonClass}
                    onClick={() => setIsUserSearchOpen(true)}
                  >
                    <div>
                      <Search />
                    </div>
                    <span>Search User</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateBackToProfile}
                >
                  <div>
                    <Video />
                  </div>
                  <span>Reels</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateBackToProfile}
                >
                  <div>
                    <Send />
                  </div>
                  <span>Messages</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateBackToProfile}
                >
                  <div>
                    <Plus />
                  </div>
                  <span>Create</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateBackToProfile}
                >
                  <div className="shrink-0">
                    <img
                      src={loggedInUser?.profilePictureUrl}
                      alt=""
                      className="size-6 rounded-full object-cover"
                    />
                  </div>
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* End of Sidebar icons */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className={navButtonClass}>
                  <div>
                    <Menu />
                  </div>
                  <span className="truncate font-semibold">More</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width) min-w-48 rounded-lg"
              >
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
