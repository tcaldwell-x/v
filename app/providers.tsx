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
  refreshSession: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  signIn: () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export function TwitterAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TwitterSession | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastCheck, setLastCheck] = useState(0);

  // Function to check session
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
      
      // Check if the response is OK
      if (!response.ok) {
        console.warn(`Session API returned status ${response.status}`);
        setSession(null);
        setStatus("unauthenticated");
        setIsInitialized(true);
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
        setIsInitialized(true);
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
        setIsInitialized(true);
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
      
      setIsInitialized(true);
      setLastCheck(Date.now());
    } catch (error) {
      console.error("Error checking session:", error);
      setSession(null);
      setStatus("unauthenticated");
      setIsInitialized(true);
    }
  };

  // Function to force refresh the session
  const refreshSession = async () => {
    console.log("Forcing session refresh");
    setStatus("loading");
    await checkSession();
  };

  // Check session on mount and periodically
  useEffect(() => {
    // Check session immediately
    checkSession();
    
    // Also set up a periodic check every 30 seconds
    const intervalId = setInterval(checkSession, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Check if we're on the callback page and refresh the session
  useEffect(() => {
    const isCallbackPage = window.location.pathname === '/api/auth/callback';
    const isProfilePage = window.location.pathname === '/profile';
    
    if (isCallbackPage || isProfilePage) {
      console.log("On callback or profile page, refreshing session");
      refreshSession();
    }
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

  // Provide a loading state until the initial session check is complete
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, status, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useTwitterAuth() {
  return useContext(AuthContext);
} 