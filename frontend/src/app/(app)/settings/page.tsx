"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const router = useRouter();

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- This is the delete function we built ---
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No login token found. Please log in again.');
      }

      // Call the secure DELETE endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      // --- Success! ---
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login?deleted=true'); // Go to login

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings and notification preferences.
      </p>

      {/* --- Notifications Card (UI only for now) --- */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose how you want to be notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="trial-matches" defaultChecked />
            <Label htmlFor="trial-matches">
              Email me about new trial matches
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="forum-replies" />
            <Label htmlFor="forum-replies">
              Email me when someone replies to my forum post
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* --- Account Card (with working Delete Button) --- */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Account</CardTitle>
          <CardDescription>
            Manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" disabled={isLoading}>
            Sign out on all devices
          </Button>

          <div className="space-y-2">
            <h3 className="font-semibold">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of your content.
            </p>
            
            {/* --- This is the new, working button --- */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, your profile,
                    and all of your publications. This data cannot be recovered.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}