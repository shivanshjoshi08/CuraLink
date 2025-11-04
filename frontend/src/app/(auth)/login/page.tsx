import { Suspense } from 'react'; // <-- 1. IMPORT SUSPENSE
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

// This page remains a Server Component (which is good!)
export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Welcome back. Enter your email to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        
        {/* --- 2. WRAP YOUR FORM IN SUSPENSE --- */}
        <Suspense fallback={<div className="text-center">Loading form...</div>}>
          <LoginForm />
        </Suspense>
        {/* --- END OF FIX --- */}
        
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}