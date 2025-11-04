"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// 1. Define the type for our Researcher data (using Mongoose _id)
type Researcher = {
  _id: string; // Mongoose sends _id
  name: string;
  email: string;
  profile_picture_url: string | null;
  conditions: string | null; // This holds their specialties
  about: string | null;
};

// 2. Define the type for the logged-in user
type StoredUser = {
  id: string; // This is the _id from Mongoose, stored as 'id'
  role: 'patient' | 'researcher';
  // ... other fields
};

export default function ExpertsPage() {
  // 3. State for loading, researchers, and errors
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 4. NEW: State for the logged-in user
  const [loggedInUser, setLoggedInUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    // 5. NEW: Get the logged-in user from localStorage
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setLoggedInUser(JSON.parse(storedUserData));
    }

    // 6. Fetch all researchers (as before)
    const fetchResearchers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/researchers`);
        if (!response.ok) {
          throw new Error('Failed to fetch experts');
        }
        const data: Researcher[] = await response.json();
        setAllResearchers(data);
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

    fetchResearchers();
  }, []); // Runs once on page load

  // 7. Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // 8. NEW: Filter the list
  // Only apply the filter if the user is a researcher
  const filteredResearchers = loggedInUser?.role === 'researcher'
    ? allResearchers.filter(expert => expert._id !== loggedInUser.id)
    : allResearchers;


  // 9. Render the UI
  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Find Health Experts</h1>
        <p className="text-muted-foreground md:text-lg">
          Connect with leading researchers and specialists in your field.
        </p>
      </div>

      {/* 10. Grid now uses the 'filteredResearchers' list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResearchers.map((expert) => (
          <Card key={expert._id} className="overflow-hidden transition-all hover:shadow-lg">
            <Link href={`/experts/${expert._id}`}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={expert.profile_picture_url || undefined} alt={expert.name} />
                  <AvatarFallback className="text-4xl">
                    {getInitials(expert.name)}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-lg font-semibold">{expert.name}</h3>

                {expert.conditions && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {expert.conditions.split(',').slice(0, 3).map((condition, index) => (
                      <Badge key={index} variant="secondary">
                        {condition.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {filteredResearchers.length === 0 && (
        <p className="text-center text-muted-foreground">
          {loggedInUser?.role === 'researcher' ? 'No other researchers found.' : 'No researchers have signed up yet.'}
        </p>
      )}
    </div>
  );
}