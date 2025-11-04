"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";

// --- 1. Define all the types we need ---
type StoredUser = {
  id: number;
  role: 'patient' | 'researcher';
};

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
  author_role: 'patient' | 'researcher';
};

type Reply = {
  id: number;
  content: string;
  created_at: string;
  author_name: string;
  profile_picture_url: string | null;
  specialties: string | null; // This is the 'conditions' column for researchers
};

export default function PostPage() {
  const params = useParams();
  const id = params.id; // This is the post's ID from the URL
  const router = useRouter();

  // State for the logged-in user
  const [user, setUser] = useState<StoredUser | null>(null);

  // State for the post and its replies
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  
  // State for the new reply form
  const [newReplyContent, setNewReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. Fetch data function ---
  const fetchPostData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/posts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post data');
      }
      const data = await response.json();
      setPost(data.post);
      setReplies(data.replies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Load data on mount ---
  useEffect(() => {
    // Get the logged-in user from localStorage
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }
    fetchPostData();
  }, [id]);

  // --- 4. Handle Reply Submission (Researchers Only) ---
  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newReplyContent.trim()) return; // Don't submit empty replies

    setSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8000/api/posts/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send auth token
        },
        body: JSON.stringify({
          content: newReplyContent,
          post_id: id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to post reply");
      }
      
      // Success! Clear the form and refresh the replies
      setNewReplyContent("");
      fetchPostData(); // Re-fetch all data to show the new reply

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  // --- 5. Render the UI ---
  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!post) {
    return <div className="p-4">Post not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      
      {/* The Main Question (Post) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
          <CardDescription>
            Asked by {post.author_name} on {new Date(post.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Card>

      {/* The List of Replies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{replies.length} Replies</h2>
        {replies.map(reply => (
          <Card key={reply.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reply.profile_picture_url || undefined} />
                  <AvatarFallback>{getInitials(reply.author_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Dr. {reply.author_name}</CardTitle>
                  <CardDescription>
                    {reply.specialties ? reply.specialties.split(',')[0] : 'Researcher'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{reply.content}</p>
            </CardContent>
          </Card>
        ))}
        {replies.length === 0 && (
          <p className="text-muted-foreground">No replies yet. Be the first to answer!</p>
        )}
      </div>

      {/* The Reply Form (Researchers Only) */}
      {user?.role === 'researcher' && (
        <Card>
          <CardHeader>
            <CardTitle>Post Your Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-content">Your Answer</Label>
                <Textarea
                  id="reply-content"
                  placeholder="Share your expertise and answer the patient's question..."
                  className="min-h-[150px]"
                  value={newReplyContent}
                  onChange={(e) => setNewReplyContent(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Reply'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}