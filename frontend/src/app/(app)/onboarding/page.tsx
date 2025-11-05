"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Define the type for our user
type StoredUser = {
  id: string;
  name: string;
  role: 'patient' | 'researcher';
};

export default function OnboardingPage() {
  const router = useRouter();
  
  // State for the user and their data fields
  const [user, setUser] = useState<StoredUser | null>(null);
  const [conditions, setConditions] = useState(""); // For conditions OR specialties
  const [about, setAbout] = useState(""); // <-- NEW: For researcher's about section
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the user from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      const parsedUser: StoredUser = JSON.parse(storedUserData);
      setUser(parsedUser);
      // We don't redirect researchers, we let them fill out this form
    } else {
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
      // 3. Prepare data to send (send both fields)
      const dataToSend = {
        conditions: conditions,
        // Only send 'about' if the user is a researcher
        about: user.role === 'researcher' ? about : undefined 
      };

      // Call the updateUser endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save information');
      }

      // 4. Update the user in localStorage
      const updatedUser = { ...user, ...dataToSend };
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
  
  // 6. Dynamic Content for the UI
  const isResearcher = user?.role === 'researcher';

  const content = {
    description: isResearcher
      ? 'List your areas of expertise and provide a brief bio. This helps patients find you.'
      : 'Please tell us about your medical conditions or interests so we can personalize your dashboard.',
    label: isResearcher
      ? 'What are your specialties?'
      : 'What conditions are you interested in?',
    placeholder: isResearcher
      ? 'e.g., Oncology, Neuroscience, Glioblastoma'
      : 'e.g., I have Brain Cancer, Glioma, or I\'m interested in Lung Cancer...'
  };

  // Show a loading screen while we check for the user
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // 7. Render the final form
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
            {/* 1. Specialties / Conditions Input */}
            <div className="space-y-2">
              <Label htmlFor="conditions">
                {content.label}
              </Label>
              <Textarea
                id="conditions"
                placeholder={content.placeholder}
                className="min-h-[100px]"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Please separate multiple items with a comma.
              </p>
            </div>
            
            {/* 2. About Me Input (Researcher Only) */}
            {isResearcher && (
              <div className="space-y-2">
                <Label htmlFor="about">
                  About Me / Professional Bio
                </Label>
                <Textarea
                  id="about"
                  placeholder="e.g., I am an immunologist specializing in novel therapies for NSCLC. My lab is based in Mumbai."
                  className="min-h-[150px]"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>
            )}
            
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