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
  Star // Added for My Favorites
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react"; 

// --- 1. Define the Types ONCE ---
type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

type StoredUser = {
  id: string; // Mongoose IDs are strings
  role: 'patient' | 'researcher';
};
// --- End Types ---


export function AppSidebarNav({ isMobile = false }) {
  const pathname = usePathname();
  
  // State to hold the real user (starts as null)
  const [user, setUser] = useState<StoredUser | null>(null);

  // Get the user from localStorage when the component loads
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }
  }, []); // Runs only once

  // --- 2. Define Arrays WITHOUT redundant typing ---
  // TypeScript now correctly infers these types.
  const patientNavLinks: NavLink[] = [
    { href: "/dashboard/patient", label: "Dashboard", icon: LayoutDashboard },
    { href: "/publications", label: "Publications", icon: BookOpen },
    { href: "/experts", label: "Find Experts", icon: Users },
    { href: "/trials", label: "Clinical Trials", icon: FlaskConical },
    { href: "/forums", label: "Forums", icon: MessageSquare },
    { href: "/favorites", label: "My Favorites", icon: Star }, // Added for Favorites
  ];

  const researcherNavLinks: NavLink[] = [
    { href: "/dashboard/researcher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/publications", label: "Publications", icon: BookOpen },
    { href: "/trials", label: "Clinical Trials", icon: FlaskConical }, 
    { href: "/experts", label: "Find Experts", icon: Users },         
    { href: "/forums", label: "Forums", icon: MessageSquare },
    { href: "/favorites", label: "My Favorites", icon: Star }, // Added for Favorites
  ];

  // If the user hasn't loaded yet, default to patient links
  const navLinks = user?.role === 'researcher' ? researcherNavLinks : patientNavLinks;
  const dashboardHref = user?.role === 'researcher' ? "/dashboard/researcher" : "/dashboard/patient";

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
                pathname.startsWith(href) && href !== "/" && "bg-muted text-primary",
                pathname === "/" && href === "/" && "bg-muted text-primary"
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
        {/* Can add a card or other content here later */}
      </div>
    </div>
  );
}