
'use client';
import { AppSidebarNav } from "./app-sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <AppSidebarNav />
    </aside>
  );
}
