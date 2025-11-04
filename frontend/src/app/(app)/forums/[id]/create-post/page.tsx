"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define the type for our user
type StoredUser = {
  id: number;
  role: 'patient' | 'researcher';
};

export default function CreatePostPage() {
  const router = useRouter();
  const params = useParams();
  const forumId = params.id as string; // This is the forum's ID

  // State for the logged-in user
  const [user, setUser] = useState<StoredUser | null>(null);
  
  // State for the form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the user and check their role
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      const parsedUser: StoredUser = JSON.parse(storedUserData);
      setUser(parsedUser);
      
      // PDF RULE: Only patients can create posts
      if (parsedUser.role !== 'patient') {
        // If a researcher lands here, send them back to the forum
        router.push(`/forums/${forumId}`);
      }
    } else {
      // If no user, send to login
      router.push('/login');
    }
  }, [router, forumId]);

  // 2. Handle the form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      // Call the 'createPost' endpoint
      const response = await fetch(`http://localhost:8000/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send auth token
        },
        body: JSON.stringify({
          title: title,
          content: content,
          forum_id: forumId // Pass the forum's ID
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      // Success! Send the user back to the forum page
      router.push(`/forums/${forumId}`);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render the form if the user isn't a patient
  if (!user || user.role !== 'patient') {
    return <div>Loading...</div>;
  }

  // 3. Render the form
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Ask a New Question</CardTitle>
          <CardDescription>
            Your question will be visible to researchers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Question Title</Label>
              <Input
                id="title"
                placeholder="e.g., What are the latest treatments for..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Your Question</Label>
              <Textarea
                id="content"
                placeholder="Provide details about your question..."
                className="min-h-[200px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Your Question'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}