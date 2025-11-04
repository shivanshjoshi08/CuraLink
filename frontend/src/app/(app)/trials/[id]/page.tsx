"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/favorite-button"; // <-- NEW IMPORT
import { Mail, ClipboardCheck, Info } from "lucide-react";

// --- Types ---
type StoredUser = { id: string; role: 'patient' | 'researcher'; };
type Researcher = { id: string; name: string; profile_picture_url: string | null; specialties: string | null; };
type Trial = {
  id: string;
  title: string;
  description: string;
  status: string;
  eligibility: string;
  location: string;
  contact_email: string;
  researcher: Researcher;
};
type Favorite = { content_id: string; content_type: string; };

// Helper to get badge color
const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
  switch (status) {
    case 'Recruiting': return 'default';
    case 'Completed': return 'outline';
    case 'Active, not recruiting': return 'secondary';
    default: return 'secondary';
  }
};
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

export default function TrialDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<StoredUser | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [initialFavorites, setInitialFavorites] = useState<Favorite[]>([]); // <-- NEW STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }
    
    if (!id) return;

    const fetchTrial = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trials/${id}`);
        if (!res.ok) throw new Error("Failed to fetch trial");
        const data: Trial = await res.json();
        setTrial(data);
        
        // Fetch favorites (only if logged in)
        if (token) {
          const resFavorites = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resFavorites.ok) {
            const data = await resFavorites.json();
            // Filter down to only trials
            setInitialFavorites(data.trials.map((t: any) => ({ content_id: t.id, content_type: 'ClinicalTrial' }))); 
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchTrial();
  }, [id]);

  if (loading) { /* ... */ }
  if (error) { return <div className="p-4 text-red-500">Error: {error}</div>; }
  if (!trial) { return <div className="p-4">Trial not found.</div>; }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusVariant(trial.status)} className="mb-2">
            {trial.status}
          </Badge>
          {/* --- 3. ADD FAVORITE BUTTON HERE --- */}
          {user && (
            <FavoriteButton
              contentId={trial.id}
              contentType='ClinicalTrial'
              initialFavorites={initialFavorites}
            />
          )}
        </div>
        
        <h1 className="text-3xl font-bold tracking-tighter">{trial.title}</h1>
        <p className="text-muted-foreground md:text-lg">
          Located at: {trial.location || 'N/A'}
        </p>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{trial.description}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" />Eligibility Criteria</CardTitle></CardHeader>
            <CardContent>
              <p className="text-base whitespace-pre-wrap">{trial.eligibility}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column (Contact) */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">To participate or learn more, contact the study team.</p>
              <Button asChild className="w-full">
                <a href={`mailto:${trial.contact_email}?subject=Inquiry about clinical trial: ${trial.title}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email to Participate
                </a>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Principal Investigator</CardTitle></CardHeader>
            <CardContent>
              <Link href={`/experts/${trial.researcher.id}`} className="flex items-center gap-3 group">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={trial.researcher.profile_picture_url || undefined} />
                  <AvatarFallback>{getInitials(trial.researcher.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold group-hover:underline">{trial.researcher.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {trial.researcher.specialties?.split(',')[0]}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}