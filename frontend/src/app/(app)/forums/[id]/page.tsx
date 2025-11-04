"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- 1. Define all the types we need ---
type StoredUser = {
  id: number;
  role: 'patient' | 'researcher';
};

type Forum = {
  id: number;
  title: string;
  description: string | null;
  author_name: string;
};

type Post = {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
};

export default function ForumPage() {
  const params = useParams();
  const id = params.id; // This is the forum's ID from the URL
  
  // State for the logged-in user
  const [user, setUser] = useState<StoredUser | null>(null);

  // State for the forum and its posts
  const [forum, setForum] = useState<Forum | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. Fetch data when the page loads ---
  useEffect(() => {
    // Get the logged-in user from localStorage
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    // Fetch the specific forum and its posts
    if (id) {
      const fetchForumData = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forums/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch forum data');
          }
          const data = await response.json();
          setForum(data.forum);
          setPosts(data.posts);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error");
        } finally {
          setLoading(false);
        }
      };
      fetchForumData();
    }
  }, [id]); // Re-run if the ID changes

  // --- 3. Render the UI ---
  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!forum) {
    return <div className="p-4">Forum not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Forum Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">{forum.title}</h1>
          <p className="text-muted-foreground md:text-lg">
            {forum.description || `A forum for discussion on ${forum.title}.`}
          </p>
        </div>
        
        {/* PDF RULE: Only patients can post questions */}
        {user?.role === 'patient' && (
          <Button asChild>
            {/* We will build this create-post page next */}
            <Link href={`/forums/${id}/create-post`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ask a Question
            </Link>
          </Button>
        )}
      </div>
      
      {/* List of Posts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Questions</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
              {/* This link will take the user to the specific post */}
              <Link href={`/posts/${post.id}`} className="block">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary">
                    {post.title}
                  </CardTitle>
                  <CardDescription>
                    Asked by {post.author_name} on {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground pt-4">
            No one has asked a question in this forum yet.
          </p>
        )}
      </div>
    </div>
  );
}