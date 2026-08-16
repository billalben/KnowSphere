import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminHeader } from "./_components/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider
      className="h-svh"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 52)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <AdminSidebar variant="inset" />

      <SidebarInset>
        {/* Header */}
        <AdminHeader />

        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto">
          <div className="@container/main flex min-h-full flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 lg:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
