"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, FlaskConical, Users } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; // Make sure Badge is imported

// --- Types (FIXED) ---
type StoredUser = {
  id: string; // <-- Mongoose IDs are strings
  name: string;
  email: string;
  role: 'patient' | 'researcher';
};

type Researcher = {
  id: string; // <-- Mongoose IDs are strings
  name: string;
  profile_picture_url: string | null;
  conditions: string | null;
};

type Publication = {
  id: string; // <-- Mongoose IDs are strings
  title: string;
  journal: string;
  year: number;
  author_name: string;
};

type ClinicalTrial = {
  id: string; // <-- Mongoose IDs are strings
  title: string;
  description: string;
  status: string;
  location: string;
  researcher_name: string;
};
// --- End Types ---

export default function PatientDashboard() {
  const [user, setUser] = useState<StoredUser | null>(null);
  
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loadingResearchers, setLoadingResearchers] = useState(true);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loadingTrials, setLoadingTrials] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    if (!token) {
      setLoadingResearchers(false);
      setLoadingPublications(false);
      setLoadingTrials(false);
      return;
    }

    // Fetch Recommended Experts
    const fetchRecommendedExperts = async () => {
      try {
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/users/recommended-experts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch experts');
        setResearchers((await response.json()).slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch recommended experts:", err);
      } finally {
        setLoadingResearchers(false);
      }
    };
    
    // Fetch Recommended Publications
    const fetchRecommendedPublications = async () => {
      try {
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/publications/recommended', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch publications');
        setPublications((await response.json()).slice(0, 2));
      } catch (err) {
        console.error("Failed to fetch recommended publications:", err);
      } finally {
        setLoadingPublications(false);
      }
    };

    // Fetch Recommended Trials
    const fetchRecommendedTrials = async () => {
      try {
        const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/trials/recommended', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch trials');
        setTrials((await response.json()).slice(0, 2));
      } catch (err) {
        console.error("Failed to fetch recommended trials:", err);
      } finally {
        setLoadingTrials(false);
      }
    };

    fetchRecommendedExperts();
    fetchRecommendedPublications();
    fetchRecommendedTrials();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-0">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
          Welcome, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground md:text-lg">
          Here's a personalized summary of resources based on your profile.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* --- Connect with Experts --- */}
        <div className="md:col-span-1 space-y-8">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Recommended Experts
                      </CardTitle>
                      <CardDescription>Based on your conditions.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                      <Link href="/experts">More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loadingResearchers ? (
                <><Skeleton className="h-[74px] w-full rounded-lg" /></>
              ) : (
                researchers.length > 0 ? (
                  researchers.map(expert => (
                      <Link href={`/experts/${expert.id}`} key={expert.id} className="group"> {/* <-- KEY IS CORRECT (uses 'id') */}
                          <div className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50 hover:shadow-sm">
                              <Avatar className="h-10 w-10">
                                  <AvatarImage src={expert.profile_picture_url || undefined} alt={expert.name} />
                                  <AvatarFallback>{getInitials(expert.name)}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                  <h3 className="font-semibold text-sm">{expert.name}</h3>
                                  <p className="text-xs text-muted-foreground">{expert.conditions ? expert.conditions.split(',')[0] : 'Researcher'}</p>
                              </div>
                          </div>
                      </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No matching experts found.</p>
                )
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* --- Right Column --- */}
        <div className="md:col-span-2 space-y-8">
            
            {/* --- Recommended Reading --- */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Recommended Reading
                        </CardTitle>
                        <CardDescription>Based on your profile and interests.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href="/publications">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {loadingPublications ? (
                  <><Skeleton className="h-[98px] w-full rounded-lg" /></>
                ) : (
                  publications.length > 0 ? (
                    publications.map(pub => (
                        <Link href={`/publications/${pub.id}`} key={pub.id} className="group"> {/* <-- KEY IS CORRECT (uses 'id') */}
                            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full">
                                <div className="p-4 flex gap-4 items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-sm leading-snug group-hover:text-primary">{pub.title}</h3>
                                        <p className="text-xs text-muted-foreground">{pub.journal}, {pub.year}</p>
                                        <p className="text-xs text-muted-foreground pt-1">By Dr. {pub.author_name.split(' ').pop()}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No matching publications found.</p>
                  )
                )}
              </CardContent>
            </Card>

            {/* --- Clinical Trials --- */}
            <Card>
              <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-primary" />
                            Explore Clinical Trials
                        </CardTitle>
                        <CardDescription>Discover trials based on your profile.</CardDescription>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href="/trials">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {loadingTrials ? (
                  <><Skeleton className="h-[98px] w-full rounded-lg" /></>
                ) : (
                  trials.length > 0 ? (
                    trials.map(trial => (
                        // We will need to create a [id] page for trials later
                        <Link href={`/trials`} key={trial.id} className="group"> {/* <-- KEY IS CORRECT (uses 'id') */}
                            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full">
                                <div className="p-4 space-y-2">
                                    <h3 className="font-semibold pt-1 text-sm group-hover:text-primary">{trial.title}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{trial.description}</p>
                                      <div className="flex items-center justify-between pt-2">
                                          <Badge variant="secondary">{trial.status}</Badge>
                                          <p className="text-xs text-muted-foreground">{trial.researcher_name}</p>
                                      </div>
                                </div>
                            </div>
                        </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No matching clinical trials found for your conditions.
                    </p>
                  )
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}