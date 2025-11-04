"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // <-- 1. IMPORT INPUT

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

export default function AllPublicationsPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. ADD FILTER STATE ---
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    const fetchAllPublications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications`);
        if (!response.ok) {
          throw new Error('Failed to fetch publications');
        }
        const data: Publication[] = await response.json();
        setPublications(data);
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

    fetchAllPublications();
  }, []); 

  // --- 3. APPLY FILTER LOGIC ---
  const filteredPublications = publications.filter(pub => {
    const term = searchTerm.toLowerCase();
    return (
      pub.title.toLowerCase().includes(term) ||
      pub.summary.toLowerCase().includes(term) ||
      pub.author_name.toLowerCase().includes(term) ||
      pub.journal.toLowerCase().includes(term)
    );
  });

  if (loading) {
    // ... (your skeleton code is fine) ...
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Publications</h1>
        <p className="text-muted-foreground md:text-lg">
          Browse all available research and publications.
        </p>
      </div>
      
      {/* --- 4. ADD SEARCH BAR UI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Search by title, author, journal, or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* --- 5. MAP THE FILTERED LIST --- */}
      <div className="space-y-4">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => (
            <Card key={pub.id} className="overflow-hidden transition-all hover:shadow-md">
              <Link href={`/publications/${pub.id}`} className="block">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary flex items-center gap-2">
                    {pub.title}
                    {user?.role === 'researcher' && user.id === pub.author_id && (
                      <Badge variant="default" className="ml-2">
                        My Publication
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {pub.journal} ({pub.year}) - By Dr. {pub.author_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pub.summary}
                  </p>
                </CardContent>
              </Link>
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