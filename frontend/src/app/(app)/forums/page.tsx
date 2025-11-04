"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button
import { MessageSquare, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- 1. Define the types ---
type StoredUser = {
  id: number;
  role: 'patient' | 'researcher';
};

type Forum = {
  id: number;
  title: string;
  description: string | null;
  author_name: string;
  created_at: string;
};

export default function ForumsPage() {
  // --- 2. Add state for the logged-in user ---
  const [user, setUser] = useState<StoredUser | null>(null);
  
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- 3. Get the logged-in user from localStorage ---
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    // 4. Fetch all forums (as before)
    const fetchAllForums = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forums`);
        if (!response.ok) {
          throw new Error('Failed to fetch forums');
        }
        const data: Forum[] = await response.json();
        setForums(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllForums();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">Forums</h1>
          <p className="text-muted-foreground md:text-lg">
            Discuss topics with patients and researchers.
          </p>
        </div>
        
        {/* --- 5. THE FIX --- */}
        {/* Only show this button if the user is a researcher */}
        {user?.role === 'researcher' && (
          <Button asChild>
            <Link href="/forums/create-forum">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Forum
            </Link>
          </Button>
        )}
      </div>
      
      {/* List of Forums (same as before) */}
      <div className="space-y-4">
        {forums.length > 0 ? (
          forums.map((forum) => (
            <Card key={forum.id} className="overflow-hidden transition-all hover:shadow-md">
              <Link href={`/forums/${forum.id}`} className="block">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {forum.title}
                  </CardTitle>
                  <CardDescription>
                    Created by Dr. {forum.author_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {forum.description || "No description provided."}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No forums have been created yet.
          </p>
        )}
      </div>
    </div>
  );
}