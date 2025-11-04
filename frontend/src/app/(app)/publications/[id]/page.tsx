"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";

// Define the type for the publication
type Publication = {
  id: number;
  title: string;
  journal: string;
  year: number;
  link: string;
  abstract: string;
  summary: string;
};

export default function PublicationPage() {
  const params = useParams();
  const id = params.id;

  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPublication = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/publications/${id}`);
          if (!res.ok) throw new Error("Failed to fetch publication");
          const data = await res.json();
          setPublication(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
          setLoading(false);
        }
      };
      fetchPublication();
    }
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading publication...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!publication) {
    return <div className="p-4">Publication not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{publication.title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {publication.journal} ({publication.year})
          </CardDescription>
          {publication.link && (
            <Button asChild className="w-fit mt-2">
              <a href={publication.link} target="_blank" rel="noopener noreferrer">
                View Full Paper <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI-Generated Summary */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">AI-Generated Summary</h3>
            <p className="text-base">{publication.summary}</p>
          </div>

          {/* Full Abstract */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Full Abstract</h3>
            <p className="text-base whitespace-pre-wrap">{publication.abstract}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}