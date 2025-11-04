"use client"; // <-- Must be a client component to use hooks

import {
  Menu,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AppSidebarNav } from "./app-sidebar-nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 1. Define the type for the user object we stored
type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'researcher';
  profile_picture_url?: string | null;
};

export default function AppHeader() {
  // 2. Use state to hold the real, logged-in user
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  // 3. Get the user from localStorage when the component loads
  useEffect(() => {
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
  }, []);

  // 4. Create a real logout function
  const handleLogout = () => {
    // Clear the user's data from the browser
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Redirect to the login page
    router.push('/login');
  };
  
  // 5. Get user initials for the avatar fallback
  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('') : '';
  const avatarUrl = user?.profile_picture_url; // Use the real profile pic URL

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
        {/* Mobile Sidebar (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AppSidebarNav isMobile={true} />
          </SheetContent>
        </Sheet>
        
        {/* Search Bar and User Menu */}
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          
          
          {/* 6. Only show the user menu if the user is loaded */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* Use the real avatar URL */}
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={user.name} />}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* 7. "Switch Role (Dev)" section is GONE.
                   We replaced it with a real logout button.
                */}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
  );
}