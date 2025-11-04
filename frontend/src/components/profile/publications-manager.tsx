"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- 1. Define Types ---
type Publication = {
  _id: string; // <-- FIX 1: Use _id
  author_id: string;
  title: string;
  journal: string;
  year: number;
  link: string;
  abstract: string;
  summary: string;
};

type PublicationsManagerProps = {
  userId: string; // Mongoose IDs are strings
};

export function PublicationsManager({ userId }: PublicationsManagerProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // <-- FIX 2: ID is now a string
  
  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [year, setYear] = useState<number | string>("");
  const [link, setLink] = useState("");
  const [abstract, setAbstract] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Function to fetch publications ---
  const fetchPublications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/publications/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch publications");
      const data = await res.json();
      setPublications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPublications();
    }
  }, [userId]);

  const resetForm = () => {
    setIsEditing(null);
    setShowForm(false);
    setTitle(""); setJournal(""); setYear(""); setLink(""); setAbstract("");
    setError(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  // --- Function to handle "Edit" ---
  const handleEdit = (pub: Publication) => {
    setIsEditing(pub._id); // <-- FIX 3: Use _id
    setTitle(pub.title);
    setJournal(pub.journal);
    setYear(pub.year);
    setLink(pub.link);
    setAbstract(pub.abstract);
    setError(null);
    setShowForm(true);
  };

  // --- Handle Delete ---
  const handleDelete = async (id: string) => { // <-- ID is a string
    const token = localStorage.getItem('token');
    if (!token) {
        setError("You are not logged in.");
        return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/publications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete publication");
      fetchPublications(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // --- Handle Submit (Create & Update) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        setError("You are not logged in.");
        return;
    }

    setSubmitting(true);
    setError(null);

    const url = isEditing
      ? `http://localhost:8000/api/publications/${isEditing}` 
      : `http://localhost:8000/api/publications`;           
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title, journal, year: Number(year), link, abstract
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save publication");

      resetForm();
      fetchPublications(); 
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>My Publications</CardTitle>
          <Button variant="outline" size="sm" onClick={showForm ? resetForm : handleAddNew}>
            {showForm ? 'Cancel' : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* --- The Form --- */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4">
            {/* ... (form fields are the same) ... */}
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Edit Publication' : 'Add New Publication'}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="pub-title">Title</Label>
              <Input id="pub-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pub-journal">Journal</Label>
                <Input id="pub-journal" value={journal} onChange={(e) => setJournal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pub-year">Year</Label>
                <Input id="pub-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-link">Full Paper URL</Label>
              <Input id="pub-link" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-abstract">Abstract</Label>
              <Textarea id="pub-abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} required placeholder="Paste the full publication abstract here. An AI summary will be generated." className="min-h-[150px]" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Publication'}
            </Button>
          </form>
        )}

        {/* --- The List of Existing Publications --- */}
        <div className="space-y-4">
          {loading && <p>Loading publications...</p>}
          {!loading && publications.length === 0 && !showForm && (
            <p className="text-muted-foreground">You have not added any publications yet.</p>
          )}
          {publications.map(pub => (
            <div key={pub._id} className="p-4 border rounded-lg"> {/* <-- FIX 4: Use _id */}
              <h4 className="font-semibold">{pub.title} ({pub.year})</h4>
              <p className="text-sm text-muted-foreground">{pub.journal}</p>
              <p className="text-sm mt-2">{pub.summary}</p>
              <div className="flex items-center gap-4 mt-4">
                <Link href={`/publications/${pub._id}`} className="text-sm text-primary hover:underline"> {/* <-- FIX 5: Use _id */}
                  View Details
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleEdit(pub)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this publication.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(pub._id)}> {/* <-- FIX 6: Use _id */}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}