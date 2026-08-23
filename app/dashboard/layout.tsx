import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { DashboardHeader } from "./_components/DashboardHeader";
import { DashboardSidebar } from "./_components/DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 52)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <DashboardSidebar variant="inset" />

      <SidebarInset className="min-h-0 overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto p-4 [&>*]:shrink-0 md:space-y-6 lg:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
