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
        // Make a request to the API to get the session
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            setSession(data.session);
            setStatus("authenticated");
          } else {
            setSession(null);
            setStatus("unauthenticated");
          }
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(null);
        setStatus("unauthenticated");
      }
    };

    checkSession();
  }, []);

  const signIn = () => {
    window.location.href = '/api/auth/twitter?action=signin';
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/twitter?action=signout', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSession(null);
        setStatus("unauthenticated");
        window.location.href = '/';
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