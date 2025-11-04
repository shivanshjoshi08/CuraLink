"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Define the properties this component needs
type FavoriteButtonProps = {
  contentId: string;
  contentType: 'User' | 'Publication' | 'ClinicalTrial';
  // Optional: Pass the list of initial favorites to set the starting state
  initialFavorites: { content_id: string }[]; 
};

export function FavoriteButton({ contentId, contentType, initialFavorites = [] }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // 1. Check the initial state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    // Check if the current contentId exists in the initial list
    const isSaved = initialFavorites.some(fav => fav.content_id === contentId);
    setIsFavorited(isSaved);
  }, [contentId, initialFavorites]);

  // 2. Handle the API interaction
  const handleToggleFavorite = async () => {
    if (!token) {
      alert("Please log in to save items to your favorites.");
      return;
    }

    const method = isFavorited ? 'DELETE' : 'POST';
    const url = isFavorited 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${contentId}` // DELETE route uses content ID
      : `${process.env.NEXT_PUBLIC_API_URL}/api/favorites`;             // POST route

    // Optimistic Update: Change the UI state immediately
    setIsFavorited(!isFavorited);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method === 'POST' ? JSON.stringify({ content_id: contentId, content_type: contentType }) : undefined,
      });

      if (!response.ok) {
        // If the API call fails, revert the UI change
        setIsFavorited(isFavorited);
        alert(`Failed to ${isFavorited ? 'remove' : 'add'} favorite. Please try again.`);
      }

    } catch (error) {
      // If network fails, revert the UI change
      setIsFavorited(isFavorited);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggleFavorite}
      className="text-gray-400 hover:text-red-500 hover:bg-transparent"
    >
      <Heart className={isFavorited ? "h-6 w-6 text-red-500 fill-red-500" : "h-6 w-6"} />
    </Button>
  );
}