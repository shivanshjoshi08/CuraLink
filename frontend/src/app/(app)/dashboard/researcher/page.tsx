"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, MessageSquare, Users, FlaskConical } from "lucide-react"; // Import FlaskConical
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationsManager } from "@/components/profile/publications-manager";
import { TrialsManager } from "@/components/profile/trials-manager";
// --- 1. IMPORT TABS ---
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// --- Define Types ---
type StoredUser = {
  id: string;
  name: string;
  role: 'patient' | 'researcher';
};

type Stats = {
  publicationCount: number;
  replyCount: number;
  collaboratorCount: number;
  repliesNeededCount: number;
};

type Collaborator = {
  id: string;
  name: string;
  profile_picture_url: string | null;
  specialties: string | null;
};

type UnansweredPost = {
  id: string;
  title: string;
};
// --- End Types ---

export default function ResearcherDashboard() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [unansweredPosts, setUnansweredPosts] = useState<UnansweredPost[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (Your useEffect and getInitials functions are perfect) ...
  useEffect(() => {
    const storedUserData = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUserData && storedToken) {
      setUser(JSON.parse(storedUserData));
      setToken(storedToken);
    }

    const fetchDashboardData = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8000/api/users/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data.stats);
        setCollaborators(data.collaborators);
        setUnansweredPosts(data.unansweredPosts);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');


  if (loading || !user) {
    // ... (Your loading skeleton code is fine) ...
    return (
      <div className="container mx-auto p-0">
        <Skeleton className="h-12 w-1/2 mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // --- 2. RENDER THE NEW TABBED LAYOUT ---
  return (
    <div className="container mx-auto p-0">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
          Welcome, {user.name}
        </h1>
        <p className="text-muted-foreground md:text-lg">
          Here's an overview of your research, collaborations, and community engagement.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        {/* --- Tab Triggers (The navigation bar) --- */}
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="publications">My Publications</TabsTrigger>
          <TabsTrigger value="trials">My Clinical Trials</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: Overview --- */}
        <TabsContent value="overview" className="space-y-8">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Publications</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.publicationCount}</div>
                <p className="text-xs text-muted-foreground">Total publications posted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.collaboratorCount}</div>
                <p className="text-xs text-muted-foreground">Other researchers on platform</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forum Replies</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.replyCount}</div>
                <p className="text-xs text-muted-foreground">Total replies given to patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Replies Needed</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.repliesNeededCount}</div>
                <p className="text-xs text-muted-foreground">New patient questions</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Collaborators & Forums */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Potential Collaborators</CardTitle>
                    <CardDescription>Connect with researchers in complementary fields.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/experts">Find More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collaborators.map(expert => {
                  const userInitials = getInitials(expert.name);
                  return (
                    <Link href={`/experts/${expert.id}`} key={expert.id} className="group">
                      <div className="rounded-lg border bg-card text-card-foreground p-4 flex items-center gap-3 transition-all hover:shadow-md hover:bg-muted/50 h-full">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={expert.profile_picture_url || undefined} alt={expert.name} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-sm">{expert.name}</h3>
                          <p className="text-xs text-muted-foreground">{expert.specialties?.split(',')[0]}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Awaiting Your Expertise</CardTitle>
                    <CardDescription>Patients have questions. Share your knowledge.</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/forums">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {unansweredPosts.length > 0 ? (
                  unansweredPosts.map(post => (
                    <Link href={`/posts/${post.id}`} key={post.id} className="block group">
                      <div className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-semibold text-sm truncate group-hover:text-primary">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">from a patient</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No new replies needed. Great job!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- TAB 2: My Publications --- */}
        <TabsContent value="publications">
          <PublicationsManager userId={user.id} />
        </TabsContent>
        
        {/* --- TAB 3: My Clinical Trials --- */}
        <TabsContent value="trials">
          <TrialsManager userId={user.id} token={token} />
        </TabsContent>

      </Tabs>
    </div>
  );
}