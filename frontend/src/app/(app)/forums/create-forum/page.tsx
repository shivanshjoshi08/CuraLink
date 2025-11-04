"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function CreateForumPage() {
  const router = useRouter();

  // State for the user
  const [user, setUser] = useState<StoredUser | null>(null);

  // State for the form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the user and check their role
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      const parsedUser: StoredUser = JSON.parse(storedUserData);
      setUser(parsedUser);

      // PDF RULE: Only researchers can create forums
      if (parsedUser.role !== 'researcher') {
        router.push('/forums'); // Send patients back
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // 2. Handle the form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      // Call the 'createForum' endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send auth token
        },
        body: JSON.stringify({
          title: title,
          description: description,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create forum");
      }

      // Success! Send the user back to the main forums page
      router.push(`/forums`);

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

  // Don't render the form if the user isn't a researcher
  if (!user || user.role !== 'researcher') {
    return <div>Loading...</div>;
  }

  // 3. Render the form
  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Forum</CardTitle>
          <CardDescription>
            Create a new discussion topic for patients and researchers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Forum Title</Label>
              <Input
                id="title"
                placeholder="e.g., Glioblastoma Research"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this forum about?"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Forum'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}