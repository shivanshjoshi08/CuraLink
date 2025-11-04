"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { Button } from "@/components/ui/button"; 
import { PlusCircle } from "lucide-react"; // Make sure PlusCircle is imported

// --- Types ---
type StoredUser = {
  id: string;
  role: 'patient' | 'researcher';
};

type Publication = {
  id: string;
  title: string;
  journal: string;
  year: number;
  summary: string;
  author_id: string;
  author_name: string;
};

type Favorite = { content_id: string; content_type: string; };
// --- End Types ---

export default function AllPublicationsPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialFavorites, setInitialFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    const fetchAllPublications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications`);
        if (!response.ok) throw new Error('Failed to fetch publications');
        const data: Publication[] = await response.json();
        setPublications(data);

        if (token) {
          const resFavorites = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resFavorites.ok) {
            const data = await resFavorites.json();
            setInitialFavorites(data.publications.map((p: any) => ({ content_id: p.id, content_type: 'Publication' }))); 
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPublications();
  }, []); 

  const filteredPublications = publications.filter(pub => {
    const term = searchTerm.toLowerCase();
    return (
      pub.title.toLowerCase().includes(term) ||
      pub.summary.toLowerCase().includes(term) ||
      pub.author_name.toLowerCase().includes(term) ||
      pub.journal.toLowerCase().includes(term)
    );
  });

  if (loading) { /* ... */ }
  if (error) { return <div className="p-4 text-red-500">Error: {error}</div>; }

  return (
    <div className="container mx-auto p-4 space-y-6">
      
      {/* --- HEADER WITH ADD BUTTON --- */}
      <div className="flex justify-between items-center space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Publications</h1>
          <p className="text-muted-foreground md:text-lg">
            Browse all available research and publications.
          </p>
        </div>
        
        {/* Only show "Add New" button for researchers */}
        {user?.role === 'researcher' && (
          <Button asChild size="sm">
            {/* Link directly to the management tab on the dashboard */}
            <Link href="/dashboard/researcher?tab=publications">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Publication
            </Link>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search by title, author, journal, or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-4">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => (
            <Card key={pub.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <Link href={`/publications/${pub.id}`} className="flex-grow">
                  <CardTitle className="text-lg group-hover:text-primary flex items-center gap-2">
                    {pub.title}
                    {user?.role === 'researcher' && user.id === pub.author_id && (
                      <Badge variant="default" className="ml-2">My Publication</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {pub.journal} ({pub.year}) - By Dr. {pub.author_name}
                  </CardDescription>
                </Link>
                {user && (
                  <FavoriteButton 
                    contentId={pub.id} 
                    contentType='Publication' 
                    initialFavorites={initialFavorites}
                  />
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pub.summary}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground pt-8">
            No publications match your search.
          </p>
        )}
      </div>
    </div>
  );
}