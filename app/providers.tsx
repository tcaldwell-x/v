"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Define types for our auth context
export interface TwitterUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  description?: string;
}

export interface TwitterSession {
  user: TwitterUser;
  accessToken?: string;
  expiresAt?: number;
}

interface AuthContextType {
  session: TwitterSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: () => void;
  signOut: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  signIn: () => {},
  signOut: async () => {},
});

export function TwitterAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TwitterSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    // Check for session data in cookies on client side
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        
        // Make a request to the API to get the session
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        });
        
        console.log("Session API response status:", response.status);
        console.log("Session API response headers:", Object.fromEntries(response.headers.entries()));
        
        // Check if the response is OK
        if (!response.ok) {
          console.warn(`Session API returned status ${response.status}`);
          setSession(null);
          setStatus("unauthenticated");
          return;
        }
        
        // Check content type to ensure we're getting JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Session API returned non-JSON response:", contentType);
          
          // Try to get the response text for debugging
          const text = await response.text();
          console.warn("Response text:", text.substring(0, 200) + "...");
          
          setSession(null);
          setStatus("unauthenticated");
          return;
        }
        
        // Try to parse the JSON response
        let data;
        try {
          data = await response.json();
          console.log("Session data:", data);
        } catch (parseError) {
          console.error("Error parsing session JSON:", parseError);
          setSession(null);
          setStatus("unauthenticated");
          return;
        }
        
        // Process the session data
        if (data.session) {
          console.log("Setting authenticated session:", data.session.user.username);
          setSession(data.session);
          setStatus("authenticated");
        } else {
          console.log("No session data found, setting unauthenticated");
          setSession(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
        setStatus("unauthenticated");
      }
    };

    // Check session immediately
    checkSession();
    
    // Also set up a periodic check every 30 seconds
    const intervalId = setInterval(checkSession, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const signIn = () => {
    console.log("Initiating sign in...");
    window.location.href = '/api/auth/twitter?action=signin';
  };

  const signOut = async () => {
    try {
      console.log("Initiating sign out...");
      const response = await fetch('/api/auth/twitter?action=signout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log("Sign out successful");
        setSession(null);
        setStatus("unauthenticated");
        window.location.href = '/';
      } else {
        console.error("Sign out failed:", response.status);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useTwitterAuth() {
  return useContext(AuthContext);
} 