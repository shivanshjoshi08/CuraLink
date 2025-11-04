"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, BookOpen } from "lucide-react";

// Define the types
type Researcher = {
    id: number;
    name: string;
    email: string;
    profile_picture_url: string | null;
    conditions: string | null;
    role: 'patient' | 'researcher';
    about: string | null;
};

type Publication = {
    id: number;
    title: string;
    journal: string;
    year: number;
    link: string;
    summary: string;
};

export default function ResearcherProfilePage() {
    const params = useParams();
    const id = params.id as string;

    // State for all our data
    const [researcher, setResearcher] = useState<Researcher | null>(null);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data for this specific researcher AND their publications
    useEffect(() => {
        if (!id) return;

        const fetchProfileData = async () => {
            try {
                // Fetch researcher details
                const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`);
                if (!resUser.ok) throw new Error('Failed to fetch researcher');
                const userData: Researcher = await resUser.json();
                if (userData.role !== 'researcher') {
                    throw new Error('This user is not a researcher');
                }
                setResearcher(userData);

                // Fetch researcher publications
                const resPubs = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications/user/${id}`);
                if (!resPubs.ok) throw new Error('Failed to fetch publications');
                const pubsData: Publication[] = await resPubs.json();
                setPublications(pubsData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    };

    if (loading) {
        return <div className="p-4">Loading expert profile...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!researcher) {
        return <div className="p-4">Researcher not found.</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Profile Header Card */}
            <Card>
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={researcher.profile_picture_url || undefined} alt={researcher.name} />
                        <AvatarFallback className="text-6xl">
                            {getInitials(researcher.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 text-center md:text-left">
                        <h1 className="text-3xl font-bold">{researcher.name}</h1>
                        {researcher.conditions && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {researcher.conditions.split(',').map((condition, index) => (
                                    <Badge key={index} variant="secondary">
                                        {condition.trim()}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <Button asChild>
                            <a href={`mailto:${researcher.email}`}>
                                <Mail className="mr-2 h-4 w-4" /> Contact {researcher.name.split(' ')[0]}
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* About Card */}
            <Card>
                <CardHeader>
                    <CardTitle>About Dr. {researcher.name.split(' ').pop()}</CardTitle>
                </CardHeader>
                <CardContent>
                    {researcher.about ? (
                        <p className="whitespace-pre-wrap">{researcher.about}</p>
                    ) : (
                        <p className="text-muted-foreground">This researcher has not added an "About" section yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* --- NEW Publications Card --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Publications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {publications.length > 0 ? (
                        publications.map(pub => (
                            <div key={pub.id} className="p-4 border rounded-lg">
                                <h4 className="font-semibold">{pub.title} ({pub.year})</h4>
                                <p className="text-sm text-muted-foreground">{pub.journal}</p>
                                <p className="text-sm mt-2">{pub.summary}</p>
                                {pub.link && (
                                    <Link href={`/publications/${pub.id}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                                        View Details
                                    </Link>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">This researcher has not added any publications yet.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}