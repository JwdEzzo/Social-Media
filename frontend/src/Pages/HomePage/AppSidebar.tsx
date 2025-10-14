// AppSidebar.tsx
import { LogOutIcon, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
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
    </Sidebar>
  );
}

export default AppSidebar;
