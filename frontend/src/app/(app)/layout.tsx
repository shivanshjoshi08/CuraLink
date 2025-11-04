
'use client';

import AppHeader from "@/components/layout/app-header";
import AppLayout from "@/components/layout/app-layout";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
