"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  FlaskConical,
  HeartHandshake,
  LayoutDashboard,
  MessageSquare,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react"; // 1. Import React hooks

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

// 2. Define a type for the user object we stored in localStorage
type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'researcher';
  // Add other fields if you store them
};

export function AppSidebarNav({ isMobile = false }) {
  const pathname = usePathname();
  
  // 3. Create state to hold the real user (starts as null)
  const [user, setUser] = useState<StoredUser | null>(null);

  // 4. Use useEffect to safely access localStorage on the client
  useEffect(() => {
    // This code only runs in the browser
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }
    // If no user is found, they remain null
  }, []); // The empty [] array means this runs only once when the component mounts

  // 5. Define the nav links for each role
  const patientNavLinks: NavLink[] = [
    { href: "/dashboard/patient", label: "Dashboard", icon: LayoutDashboard },
    { href: "/publications", label: "Publications", icon: BookOpen },
    { href: "/experts", label: "Find Experts", icon: Users },
    { href: "/trials", label: "Clinical Trials", icon: FlaskConical },
    { href: "/forums", label: "Forums", icon: MessageSquare },
  ];

  const researcherNavLinks: NavLink[] = [
    { href: "/dashboard/researcher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/publications", label: "Publications", icon: BookOpen },
    { href: "/trials", label: "Clinical Trials", icon: FlaskConical }, // <-- ADDED
    { href: "/experts", label: "Find Experts", icon: Users },         // <-- ADDED
    { href: "/forums", label: "Forums", icon: MessageSquare },
  ];

  // 6. Handle the loading state
  // While we're checking localStorage, 'user' will be null.
  // We'll show a "loading" version of the sidebar.
  if (!user) {
    return (
      <div className={cn("flex h-full max-h-screen flex-col gap-2", { "p-4": isMobile })}>
        <div className={cn("flex h-16 items-center border-b px-6", { "px-0 border-none": isMobile })}>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span>CuraLink</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          {/* You can add loading skeletons here */}
        </div>
      </div>
    );
  }

  // 7. Now that we have a real user, determine the correct links
  const navLinks = user.role === 'researcher' ? researcherNavLinks : patientNavLinks;
  const dashboardHref = user.role === 'researcher' ? "/dashboard/researcher" : "/dashboard/patient";

  return (
    <div className={cn("flex h-full max-h-screen flex-col gap-2", { "p-4": isMobile })}>
      <div className={cn("flex h-16 items-center border-b px-6", { "px-0 border-none": isMobile })}>
        <Link href={dashboardHref} className="flex items-center gap-2 font-semibold">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span>CuraLink</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className={cn("grid items-start px-4 text-sm font-medium", { "px-0": isMobile })}>
          {navLinks.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                // This logic highlights the active link
                pathname === href && "bg-muted text-primary" 
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        {/* We can add a user profile button here later */}
      </div>
    </div>
  );
}