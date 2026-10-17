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
  useSidebar,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/auth/authSlice";
import { useAuth } from "@/auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetUserByUsernameQuery } from "@/api/users/userApi";
import { useState } from "react";
import UserAvatar from "@/components/custom/user-avatar";

const navButtonClass =
  "h-10 cursor-pointer gap-3 px-1 font-medium transition-colors group-data-[collapsible=icon]:my-1 group-data-[collapsible=icon]:p-1!";

const headerButtonClass =
  "cursor-pointer rounded-md my-1 p-1 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring";

function AppSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useAuth();
  const { setOpen } = useSidebar();
  // Sidebar expands while hovered, and stays expanded while the "More" menu is open
  // (its content renders in a portal outside the sidebar, which fires mouseleave)
  const [isHovered, setIsHovered] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { data: loggedInUser } = useGetUserByUsernameQuery(username!, {
    skip: !username,
  });

  function handleMouseEnter() {
    setIsHovered(true);
    setOpen(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    if (!isMoreOpen) setOpen(false);
  }

  function handleMoreOpenChange(isOpen: boolean) {
    setIsMoreOpen(isOpen);
    if (!isOpen && !isHovered) setOpen(false);
  }

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  function getBackToHomeOrScrollToTop() {
    if (location.pathname === `/home/${username}`) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(`/home/${username}`);
    }
  }

  function navigateBackToProfile() {
    navigate(`/userprofile/${username}`);
  }

  function navigateToSearchPage() {
    navigate(`/search`);
  }

  return (
    // z-20 + shadow: when expanded it overlays the page (incl. sticky z-10 headers)
    <Sidebar
      collapsible="icon"
      className="z-20 group-data-[state=expanded]:shadow-xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sidebar Header - Instagram Icon Button */}
      <SidebarHeader className="flex items-start px-2 py-1">
        <button
          type="button"
          aria-label="Home"
          className={headerButtonClass}
          onClick={getBackToHomeOrScrollToTop}
        >
          <Instagram className="size-6" />
        </button>
      </SidebarHeader>
      {/* End of Header - Start of Content */}
      <SidebarContent>
        <SidebarGroup className="my-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Home Icon */}
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
              {/* Search */}
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateToSearchPage}
                >
                  <div>
                    <Search />
                  </div>
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Reels */}
              <SidebarMenuItem></SidebarMenuItem>
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
              {/* Messages */}
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
              {/* Create Post */}
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
              {/* Profile */}
              <SidebarMenuItem className="mt-1">
                <SidebarMenuButton
                  className={navButtonClass}
                  onClick={navigateBackToProfile}
                >
                  <div className="shrink-0">
                    <UserAvatar
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
          {/* More Dropdown */}
          <SidebarMenuItem>
            <DropdownMenu modal={false} onOpenChange={handleMoreOpenChange}>
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
