"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FlaskConical, Users, Heart } from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// --- 1. Define Types ---
type StoredUser = {
    id: string;
    role: 'patient' | 'researcher';
};

type Expert = {
    _id: string; // Mongoose ID
    name: string;
    profile_picture_url: string | null;
    conditions: string | null; // Specialties
};

type Publication = {
    id: string;
    title: string;
    journal: string;
    year: number;
    author_name: string;
    summary: string;
};

type Trial = {
    id: string;
    title: string;
    status: string;
    researcher_name: string;
};

type FavoritesData = {
    experts: Expert[];
    publications: Publication[];
    trials: Trial[];
};
// --- End Types ---

export default function FavoritesPage() { // <-- The correct DEFAULT EXPORT
    const [user, setUser] = useState<StoredUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<FavoritesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // --- 2. Fetch all favorites data ---
    const fetchFavorites = async (authToken: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch favorites: ' + response.status);
            }

            const text = await response.text();
            // Safely parse JSON or default to empty arrays if response is empty
            const data: FavoritesData = text ? JSON.parse(text) : { experts: [], publications: [], trials: [] };

            setFavorites(data);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUserData = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUserData && storedToken) {
            setUser(JSON.parse(storedUserData));
            setToken(storedToken);
            fetchFavorites(storedToken); // Fetch data on load
        } else {
            setLoading(false);
            setError("Please log in to see your favorites.");
        }
    }, []);

    const getInitials = (name: string) => user ? name.split(' ').map(n => n[0]).join('') : '';

    // --- 3. Handle "Unfavorite" ---
    const handleUnfavorite = async (contentId: string) => {
        if (!token) return;

        // Optimistic Update: Change the UI state immediately
        if (favorites) {
            setFavorites({
                experts: favorites.experts.filter(item => item._id !== contentId),
                publications: favorites.publications.filter(item => item.id !== contentId),
                trials: favorites.trials.filter(item => item.id !== contentId),
            });
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${contentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // If API fails, fetch data to revert the optimistic update
            if (!response.ok) {
                fetchFavorites(token);
            }
        } catch (err) {
            // If network fails, fetch data to revert the optimistic update
            fetchFavorites(token);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 space-y-6">
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-6 w-1/2 rounded-lg" />
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
                <h1 className="text-3xl font-bold tracking-tighter">My Favorites</h1>
                <p className="text-muted-foreground md:text-lg">
                    Your saved experts, publications, and clinical trials.
                </p>
            </div>

            <Tabs defaultValue="experts" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="experts">
                        <Users className="mr-2 h-4 w-4" />
                        Experts ({favorites?.experts.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="publications">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Publications ({favorites?.publications.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="trials">
                        <FlaskConical className="mr-2 h-4 w-4" />
                        Clinical Trials ({favorites?.trials.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* --- Experts Tab --- */}
                <TabsContent value="experts">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites?.experts.length ? (
                            favorites.experts.map((expert) => (
                                <Card key={expert._id} className="flex flex-col">
                                    <Link href={`/experts/${expert._id}`} className="flex-grow">
                                        <CardContent className="p-6 flex flex-col items-center text-center">
                                            <Avatar className="h-24 w-24 mb-4">
                                                <AvatarImage src={expert.profile_picture_url || undefined} alt={expert.name} />
                                                <AvatarFallback className="text-4xl">{getInitials(expert.name)}</AvatarFallback>
                                            </Avatar>
                                            <h3 className="text-lg font-semibold">{expert.name}</h3>
                                            <p className="text-sm text-muted-foreground">{expert.conditions?.split(',')[0]}</p>
                                        </CardContent>
                                    </Link>
                                    <Button variant="ghost" size="sm" className="m-2" onClick={() => handleUnfavorite(expert._id)}>
                                        <Heart className="mr-2 h-4 w-4 text-red-500 fill-red-500" /> Unfavorite
                                    </Button>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted-foreground">You haven't favorited any experts yet.</p>
                        )}
                    </div>
                </TabsContent>

                {/* --- Publications Tab --- */}
                <TabsContent value="publications">
                    <div className="space-y-4">
                        {favorites?.publications.length ? (
                            favorites.publications.map((pub) => (
                                <Card key={pub.id} className="flex items-center justify-between p-4">
                                    <Link href={`/publications/${pub.id}`} className="flex-grow">
                                        <CardHeader className="p-0">
                                            <CardTitle className="text-lg group-hover:text-primary">{pub.title}</CardTitle>
                                            <CardDescription>{pub.journal} ({pub.year}) - By Dr. {pub.author_name}</CardDescription>
                                        </CardHeader>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="ml-4" onClick={() => handleUnfavorite(pub.id)}>
                                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                                    </Button>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted-foreground">You haven't favorited any publications yet.</p>
                        )}
                    </div>
                </TabsContent>

                {/* --- Clinical Trials Tab --- */}
                <TabsContent value="trials">
                    <div className="space-y-4">
                        {favorites?.trials.length ? (
                            favorites.trials.map((trial) => (
                                <Card key={trial.id} className="flex items-center justify-between p-4">
                                    <Link href={`/trials/${trial.id}`} className="flex-grow">
                                        <CardHeader className="p-0">
                                            <CardTitle className="text-lg group-hover:text-primary">{trial.title}</CardTitle>
                                            <CardDescription>Led by: Dr. {trial.researcher_name}</CardDescription>
                                        </CardHeader>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="ml-4" onClick={() => handleUnfavorite(trial.id)}>
                                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                                    </Button>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted-foreground">You haven't favorited any clinical trials yet.</p>
                        )}
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}