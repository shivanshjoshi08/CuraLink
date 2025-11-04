"use client";
import { PublicationsManager } from "@/components/profile/publications-manager";
import { TrialsManager } from "@/components/profile/trials-manager"; // <-- ADD THIS
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

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea"; // Make sure Textarea is imported

// Define the type for our user
type StoredUser = {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'researcher';
    profile_picture_url?: string | null;
    conditions?: string | null;
    about?: string | null; // <-- This type is correct
};

export default function ProfilePage() {
    const router = useRouter();

    // State for the user and the form fields
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<StoredUser | null>(null);
    const [name, setName] = useState("");
    const [profilePictureUrl, setProfilePictureUrl] = useState("");
    const [conditions, setConditions] = useState("");
    const [about, setAbout] = useState("");

    // State for loading and success messages
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get the token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No login token found. Please log in again.');
            }

            // Call the new secure DELETE endpoint
            const response = await fetch(`http://localhost:8000/api/users/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Send the token for authentication
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete account');
            }

            // --- Success! ---
            // Clear localStorage and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/login?deleted=true'); // Go to login with a success message

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 1. Load the user from localStorage
    useEffect(() => {
        const storedUserData = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUserData) {
            const parsedUser: StoredUser = JSON.parse(storedUserData);
            setUser(parsedUser);
            setToken(storedToken);
            // 2. Populate the form with the user's current data
            setName(parsedUser.name);
            setProfilePictureUrl(parsedUser.profile_picture_url || "");
            setConditions(parsedUser.conditions || "");
            setAbout(parsedUser.about || ""); // This is fine, it will just be empty for patients
        } else {
            router.push('/login');
        }
    }, [router]);

    // 3. Handle the form submission

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (!user) return;

        // --- THIS IS THE FIX ---
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            setError("You are not logged in. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            const updatedData = {
                name,
                profile_picture_url: profilePictureUrl,
                conditions,
                about: user.role === 'researcher' ? about : undefined
            };

            // 4. Send the updated data to the correct URL: '/api/users/' (with no ID)
            const response = await fetch(`http://localhost:8000/api/users/`, { // <-- URL IS FIXED
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <-- TOKEN IS ADDED
                },
                body: JSON.stringify(updatedData),
            });
            // --- END FIX ---

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // 5. Update the user in localStorage
            const updatedUser = data.user; // Get the full user object back
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser); // Update state for this page

            setSuccess('Profile saved successfully!');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const userInitials = user ? user.name.split(' ').map(n => n[0]).join('') : '';

    if (!user) {
        return <div>Loading profile...</div>;
    }

    // This is the UI you see
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* --- The Avatar --- */}
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profilePictureUrl || undefined} alt={user.name} />
                                <AvatarFallback className="text-4xl">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <Label htmlFor="picture-url" className="text-center">
                                Profile Picture URL
                            </Label>
                            <Input
                                id="picture-url"
                                placeholder="https://your-image.com/pic.png"
                                value={profilePictureUrl}
                                onChange={(e) => setProfilePictureUrl(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                (For now, please paste a URL to an image.)
                            </p>
                        </div>

                        {/* --- Full Name --- */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* --- Email --- */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (cannot be changed)</Label>
                            <Input
                                id="email"
                                value={user.email}
                                disabled
                            />
                        </div>

                        {/* --- Conditions / Specialties --- */}
                        <div className="space-y-2">
                            <Label htmlFor="conditions">
                                {user.role === 'patient' ? 'My Conditions' : 'My Specialties'}
                            </Label>
                            <Input
                                id="conditions"
                                placeholder={user.role === 'patient' ? "e.g., Glioblastoma, Hypertension" : "e.g., Oncology, Neuroscience"}
                                value={conditions}
                                onChange={(e) => setConditions(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Please separate items with a comma.
                            </p>
                        </div>

                        {/* --- NEW: "About Me" section (Researchers Only) --- */}
                        {user.role === 'researcher' && (
                            <div className="space-y-2">
                                <Label htmlFor="about">
                                    About Me
                                </Label>
                                <Textarea
                                    id="about"
                                    placeholder="Tell everyone a bit about your work, research, and interests..."
                                    value={about}
                                    onChange={(e) => setAbout(e.target.value)}
                                    className="min-h-[150px]"
                                />
                            </div>
                        )}

                        {/* --- Success/Error Messages --- */}
                        {success && <p className="text-green-600 text-sm">{success}</p>}
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            
            {/* Only show these managers to researchers */}
            {user.role === 'researcher' && (
                <>
                    <PublicationsManager userId={user.id} />
                    <TrialsManager userId={user.id} token={token} /> {/* <-- ADD THIS */}
                </>
            )}
        </div>
    );
}