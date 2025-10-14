import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/Pages/HomePage/AppSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="dark:bg-gray-900 bg-gray-50 h-full">
      <AppSidebar />
      <main>{children}</main>
    </SidebarProvider>
  );
}
