// AppSidebar.tsx
import { ChevronUp, LogOutIcon, User, User2 } from "lucide-react";

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

function AppSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useAuth();

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  function navigateBackToProfile() {
    navigate(`/userprofile/${username}`);
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
                  Profile
                </SidebarMenuButton>
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
