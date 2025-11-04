"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
type ClinicalTrial = {
  _id: string; // <-- FIX 1: Use _id, as this is what Mongoose sends
  researcher_id: string; // <-- FIX 2: This is also a string ID
  title: string;
  description: string;
  status: 'Recruiting' | 'Active, not recruiting' | 'Completed' | 'Other';
  eligibility: string;
  location: string;
  contact_email: string;
};

type TrialsManagerProps = {
  userId: string;
  token: string | null;
};

export function TrialsManager({ userId, token }: TrialsManagerProps) {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Recruiting",
    eligibility: "",
    location: "",
    contact_email: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 2. Function to fetch researcher's trials ---
  const fetchMyTrials = async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/trials/my-trials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch your trials");
      const data = await res.json();
      setTrials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a token
    if(token) {
      fetchMyTrials();
    }
  }, [userId, token]); // Re-run if token changes

  // --- 3. Helper functions for the form ---
  const resetForm = () => {
    setIsEditing(null);
    setShowForm(false);
    setError(null);
    setFormData({
      title: "", description: "", status: "Recruiting",
      eligibility: "", location: "", contact_email: "",
    });
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (trial: ClinicalTrial) => {
    setIsEditing(trial._id); // <-- FIX 3: Use _id
    setFormData({
      title: trial.title,
      description: trial.description,
      status: trial.status,
      eligibility: trial.eligibility,
      location: trial.location,
      contact_email: trial.contact_email,
    });
    setError(null);
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  // --- 4. Handle Delete ---
  const handleDelete = async (id: string) => { // <-- FIX 4: ID is a string
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/trials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete trial");
      fetchMyTrials(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // --- 5. Handle Submit (Create & Update) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
        setError("You are not logged in.");
        return;
    }
    setSubmitting(true);
    setError(null);

    const url = isEditing
      ? `http://localhost:8000/api/trials/${isEditing}` // UPDATE
      : `http://localhost:8000/api/trials`;           // CREATE
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save trial");

      resetForm();
      fetchMyTrials(); // Refresh list
      
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
          <CardTitle>My Clinical Trials</CardTitle>
          <Button variant="outline" size="sm" onClick={showForm ? resetForm : handleAddNew}>
            {showForm ? 'Cancel' : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Trial
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* --- The Form --- */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4">
            {/* ... (The form itself is fine) ... */}
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Edit Clinical Trial' : 'Add New Clinical Trial'}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="title">Trial Title</Label>
              <Input id="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={handleStatusChange} value={formData.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recruiting">Recruiting</SelectItem>
                  <SelectItem value="Active, not recruiting">Active, not recruiting</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="A brief description of the trial..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eligibility">Eligibility</Label>
              <Textarea id="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="Key eligibility criteria..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={handleChange} placeholder="e.g., City, State or Nationwide" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" type="email" value={formData.contact_email} onChange={handleChange} placeholder="contact@trial.com" />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Trial'}
            </Button>
          </form>
        )}

        {/* --- The List of Existing Trials --- */}
        <div className="space-y-4">
          {loading && <p>Loading your trials...</p>}
          {!loading && trials.length === 0 && !showForm && (
            <p className="text-muted-foreground">You have not added any clinical trials yet.</p>
          )}
          {trials.map(trial => (
            <div key={trial._id} className="p-4 border rounded-lg"> {/* <-- FIX 5: Use _id */}
              <h4 className="font-semibold">{trial.title}</h4>
              <p className="text-sm text-muted-foreground">
                Status: <span className="font-medium text-primary">{trial.status}</span>
              </p>
              <p className="text-sm mt-2 line-clamp-2">{trial.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(trial)}>
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
                        This action cannot be undone. This will permanently delete this clinical trial.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(trial._id)}> {/* <-- FIX 6: Use _id */}
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