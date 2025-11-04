"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/ui/favorite-button"; // <-- IMPORT

// --- Types ---
type Researcher = {
  _id: string;
  name: string;
  email: string;
  profile_picture_url: string | null;
  conditions: string | null;
  about: string | null;
};

type StoredUser = {
  id: string;
  role: 'patient' | 'researcher';
};

type Favorite = {
  content_id: string;
  content_type: string;
};
// --- End Types ---

export default function ExpertsPage() {
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<StoredUser | null>(null);
  const [initialFavorites, setInitialFavorites] = useState<Favorite[]>([]); // <-- NEW STATE

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUserData) {
      setLoggedInUser(JSON.parse(storedUserData));
    }

    const fetchInitialData = async () => {
      try {
        // Fetch all researchers
        const resResearchers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/researchers`);
        if (!resResearchers.ok) throw new Error('Failed to fetch experts');
        setAllResearchers(await resResearchers.json());

        // Fetch user's current favorites (only if logged in)
        if (token) {
          const resFavorites = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resFavorites.ok) {
            const data = await resFavorites.json();
            // Filter down to only experts for the initial state check
            setInitialFavorites(data.experts.map((e: any) => ({ content_id: e._id }))); 
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const filteredResearchers = loggedInUser?.role === 'researcher'
    ? allResearchers.filter(expert => expert._id !== loggedInUser.id)
    : allResearchers;


  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResearchers.map((expert) => (
          <Card key={expert._id} className="overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="flex justify-end w-full">
                {/* --- FAVORITE BUTTON --- */}
                <FavoriteButton 
                  contentId={expert._id} 
                  contentType='User' 
                  initialFavorites={initialFavorites}
                />
              </div>

              <Link href={`/experts/${expert._id}`} className="flex flex-col items-center -mt-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={expert.profile_picture_url || undefined} alt={expert.name} />
                  <AvatarFallback className="text-4xl">{getInitials(expert.name)}</AvatarFallback>
                </Avatar>
                
                <h3 className="text-lg font-semibold">{expert.name}</h3>
              </Link>
              
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