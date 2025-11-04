"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Define the type for our user
type StoredUser = {
  id: number;
  name: string;
  role: 'patient' | 'researcher';
};

export default function OnboardingPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<StoredUser | null>(null);
  // This one state will hold 'conditions' for patients OR 'specialties' for researchers
  const [textInput, setTextInput] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the user from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      const parsedUser: StoredUser = JSON.parse(storedUserData);
      setUser(parsedUser);
    } else {
      // If no user, send to login
      router.push('/login');
    }
  }, [router]);

  // 2. Handle the form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      // 3. Call your existing 'updateUser' endpoint
      // It saves the data to the 'conditions' column (which we use for both)
      const response = await fetch(`http://localhost:8000/api/users/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conditions: textInput // Send the text (conditions OR specialties)
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save information');
      }

      // 4. Update the user in localStorage
      const updatedUser = data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // 5. Send them to their correct dashboard
      if (user.role === 'patient') {
        router.push('/dashboard/patient');
      } else {
        router.push('/dashboard/researcher');
      }

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
  
  // --- 6. Dynamic Content for the UI ---
  // This object holds the different text for each role
  const content = {
    description: user?.role === 'patient'
      ? 'Please tell us about your medical conditions or interests so we can personalize your dashboard.'
      : 'List your areas of expertise. This will help patients and other researchers find you.',
    label: user?.role === 'patient'
      ? 'What conditions are you interested in?'
      : 'What are your specialties?',
    placeholder: user?.role === 'patient'
      ? 'e.g., I have Brain Cancer, Glioma, or I\'m interested in Lung Cancer...'
      : 'e.g., Oncology, Neuroscience, Glioblastoma'
  };

  // Show a loading screen while we check for the user
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // 7. Render the form
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user.name}!</CardTitle>
          <CardDescription>
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditions">
                {content.label}
              </Label>
              <Textarea
                id="conditions"
                placeholder={content.placeholder}
                className="min-h-[100px]"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Please separate multiple items with a comma.
              </p>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Finish Setup & Go to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}