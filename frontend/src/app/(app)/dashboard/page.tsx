"use client"; // <-- ADD THIS

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Define a type for our user
type StoredUser = {
  role: 'patient' | 'researcher';
  // ... other fields
};

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Get the user data from localStorage
    const storedUserData = localStorage.getItem('user');

    if (storedUserData) {
      const user: StoredUser = JSON.parse(storedUserData);
      
      // Redirect based on the REAL role
      if (user.role === 'researcher') {
        router.push('/dashboard/researcher');
      } else {
        router.push('/dashboard/patient');
      }
    } else {
      // If no user is found in localStorage, send them to login
      router.push('/login');
    }
  }, [router]); // Re-run if router changes

  // Show a loading state while redirecting
  return <div>Loading...</div>; 
}