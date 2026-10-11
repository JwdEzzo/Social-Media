import { Outlet } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/Pages/HomePage/AppSidebar";

// Layout route: every nested route renders inside the inset via <Outlet />,
// so the sidebar stays mounted across navigations instead of remounting per page.
export default function Layout() {
  return (
    <SidebarProvider
      defaultOpen={false}
      className="[&_[data-slot=sidebar-gap]]:w-(--sidebar-width-icon)!"
    >
      <AppSidebar />
      <SidebarInset>
        {/* Mobile only: the sidebar is an off-canvas sheet there, so it needs a trigger outside it */}
        <div className="flex h-12 items-center border-b border-border px-3 md:hidden">
          <SidebarTrigger className="size-9 rounded-full" />
        </div>
        {/* Positioning context for page-level absolute elements (e.g. NavigateBack) */}
        <div className="relative flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
