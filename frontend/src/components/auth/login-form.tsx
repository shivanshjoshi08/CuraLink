"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- 1. State for the form ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // --- 2. State for loading and errors ---
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we just registered (for the success message)
  const registered = searchParams.get("registered");

  // --- 3. The new submit function ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call your backend login endpoint
      const response = await fetch('http://localhost:8000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 'data.message' will be "Invalid credentials"
        throw new Error(data.message || 'Login failed');
      }

      // --- 4. SUCCESS! Store user data and token ---
      // We use localStorage to remember the user is logged in
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // --- 5. Redirect to the dashboard ---
      // We check their role to send them to the right dashboard
      if (data.user.role === 'patient') {
        router.push("/dashboard/patient");
      } else if (data.user.role === 'researcher') {
        router.push("/dashboard/researcher");
      } else {
        router.push("/dashboard"); // A fallback
      }

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

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Show a success message if they just registered */}
      {registered && (
        <p className="text-green-600 text-sm text-center">
          Registration successful! Please log in.
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password" // You can build this page later
            className="ml-auto inline-block text-sm underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Show error message if it exists */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}