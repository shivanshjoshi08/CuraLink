"use client";

import { useState } from "react"; // Import React's state hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();

  // --- 1. Add state for all our form fields ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // Default to 'patient'

  // --- 2. Add state for loading and errors ---
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- 3. This is the new submit function ---
  // --- 2. Create the real handleSubmit function ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(null);     // Clear any old errors

    try {
      // --- Step 1: Register the new user ---
      const registerResponse = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerData.message || 'Something went wrong during registration');
      }

      // --- Step 2: Auto-Login the new user ---
      const loginResponse = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Use the same email/password
      });

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Registration successful, but auto-login failed. Please log in manually.');
      }

      // --- Step 3: Save user data and token ---
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));

      // --- Step 4: Redirect ALL users to onboarding ---
      // Both patients and researchers will go to this page
      // to fill in their conditions/specialties.
      router.push("/onboarding");

    } catch (err) {
      // Handle errors (e.g., "Email already in use")
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // --- 4. The form is updated to use the state ---
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input
          id="full-name"
          placeholder="John Doe"
          required
          value={name} // Connect to state
          onChange={(e) => setName(e.target.value)} // Update state on change
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email} // Connect to state
          onChange={(e) => setEmail(e.target.value)} // Update state on change
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password} // Connect to state
          onChange={(e) => setPassword(e.target.value)} // Update state on change
        />
      </div>
      <div className="grid gap-2">
        <Label>I am a...</Label>
        <RadioGroup
          defaultValue="patient"
          className="grid grid-cols-2 gap-4"
          onValueChange={(value) => setRole(value)} // Update state on change
        >
          <div>
            <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
            <Label
              htmlFor="patient"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              Patient / Caregiver
            </Label>
          </div>
          <div>
            <RadioGroupItem
              value="researcher"
              id="researcher"
              className="peer sr-only"
            />
            <Label
              htmlFor="researcher"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              Researcher
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* --- 5. Show error message if it exists --- */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* --- 6. Disable button while loading --- */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create an account'}
      </Button>
    </form>
  );
}