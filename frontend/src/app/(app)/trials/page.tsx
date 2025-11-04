"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { Button } from "@/components/ui/button"; 

// --- Types ---
type StoredUser = { id: string; role: 'patient' | 'researcher'; };
type ClinicalTrial = {
  id: string;
  title: string;
  description: string;
  status: 'Recruiting' | 'Active, not recruiting' | 'Completed' | 'Other';
  location: string;
  researcher_name: string;
  researcher_id: string;
};
type Favorite = { content_id: string; content_type: string; };

// Helper for Badge Color
const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
  switch (status) {
    case 'Recruiting': return 'default';
    case 'Completed': return 'outline';
    case 'Active, not recruiting': return 'secondary';
    default: return 'secondary';
  }
};
// --- End Types & Helpers ---

export default function ClinicalTrialsPage() {
  const [allTrials, setAllTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [initialFavorites, setInitialFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    const fetchAllTrials = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trials`);
        if (!response.ok) throw new Error('Failed to fetch clinical trials');
        const data: ClinicalTrial[] = await response.json();
        setAllTrials(data);

        if (token) {
          const resFavorites = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resFavorites.ok) {
            const data = await resFavorites.json();
            setInitialFavorites(data.trials.map((t: any) => ({ content_id: t.id, content_type: 'ClinicalTrial' }))); 
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAllTrials();
  }, []); 

  // Apply filters
  const filteredTrials = allTrials.filter(trial => {
    const statusMatch = statusFilter === "all" || trial.status === statusFilter;
    const locationMatch = locationFilter === "" || 
      (trial.location && trial.location.toLowerCase().includes(locationFilter.toLowerCase()));
    return statusMatch && locationMatch;
  });

  if (loading) { /* ... */ }
  if (error) { return <div className="p-4 text-red-500">Error: {error}</div>; }

  return (
    <div className="container mx-auto p-4 space-y-6">
      
      {/* --- HEADER WITH ADD BUTTON --- */}
      <div className="flex justify-between items-center space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Clinical Trials</h1>
          <p className="text-muted-foreground md:text-lg">
            Explore clinical trials based on your interests and location.
          </p>
        </div>
        
        {/* Only show "Add New" button for researchers */}
        {user?.role === 'researcher' && (
          <Button asChild size="sm">
            {/* Link directly to the management tab on the dashboard */}
            <Link href="/dashboard/researcher?tab=trials">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Trial
            </Link>
          </Button>
        )}
      </div>
      
      {/* --- Filter Controls --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <Select onValueChange={setStatusFilter} defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Recruiting">Recruiting</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Active, not recruiting">Active, not recruiting</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* --- List of Trials --- */}
      <div className="space-y-4">
        {filteredTrials.length > 0 ? (
          filteredTrials.map((trial) => (
            <Card key={trial.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <Link href={`/trials/${trial.id}`} className="flex-grow">
                  <CardTitle className="text-lg group-hover:text-primary flex items-center gap-2">
                    {trial.title}
                    {user?.role === 'researcher' && user.id === trial.researcher_id && (
                      <Badge variant="default" className="ml-2">My Trial</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Led by: Dr. {trial.researcher_name}
                  </CardDescription>
                </Link>
                {/* --- FAVORITE BUTTON --- */}
                {user && (
                  <FavoriteButton
                    contentId={trial.id}
                    contentType='ClinicalTrial'
                    initialFavorites={initialFavorites}
                  />
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {trial.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between pt-4">
                  <Badge variant={getStatusVariant(trial.status)}>
                    {trial.status}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {trial.location || "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground pt-8">
            No clinical trials match your filters.
          </p>
        )}
      </div>
    </div>
  );
}