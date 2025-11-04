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
import { FlaskConical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // <-- 1. IMPORT BADGE

// --- 2. DEFINE USER TYPE ---
type StoredUser = {
  id: string;
  role: 'patient' | 'researcher';
};

// --- 3. UPDATE TRIAL TYPE ---
type ClinicalTrial = {
  id: string;
  title: string;
  description: string;
  status: 'Recruiting' | 'Active, not recruiting' | 'Completed' | 'Other';
  location: string;
  researcher_name: string;
  researcher_id: string; // <-- 4. ADD researcher_id
};

export default function ClinicalTrialsPage() {
  const [allTrials, setAllTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  
  // --- 5. ADD USER STATE ---
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    // --- 6. GET USER FROM LOCALSTORAGE ---
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    const fetchAllTrials = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trials`);
        if (!response.ok) {
          throw new Error('Failed to fetch clinical trials');
        }
        const data: ClinicalTrial[] = await response.json();
        setAllTrials(data);
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

    fetchAllTrials();
  }, []); 

  // Apply filters
  const filteredTrials = allTrials.filter(trial => {
    const statusMatch = statusFilter === "all" || trial.status === statusFilter;
    const locationMatch = locationFilter === "" || 
      trial.location.toLowerCase().includes(locationFilter.toLowerCase());
    return statusMatch && locationMatch;
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
        <h1 className="text-3xl font-bold tracking-tighter">Clinical Trials</h1>
        <p className="text-muted-foreground md:text-lg">
          Explore clinical trials based on your interests and location.
        </p>
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {trial.title}
                  
                  {/* --- 7. THE BADGE LOGIC --- */}
                  {user?.role === 'researcher' && user.id === trial.researcher_id && (
                    <Badge variant="default" className="ml-2">
                      My Trial
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Led by: Dr. {trial.researcher_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {trial.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between pt-4">
                  <Badge variant="secondary">{trial.status}</Badge>
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