"use client"

import { useTwitterAuth } from "../providers"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ProfilePage() {
  const { session, status, signOut, refreshSession } = useTwitterAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
    
    // Force refresh the session when the profile page loads
    const refreshSessionData = async () => {
      if (!isRefreshing) {
        setIsRefreshing(true)
        console.log("Profile page mounted, refreshing session")
        await refreshSession()
        setIsRefreshing(false)
      }
    }
    
    refreshSessionData()
  }, [refreshSession, isRefreshing])

  // Update debug info when session or status changes
  useEffect(() => {
    // Add debugging information
    const debug = {
      status,
      hasSession: !!session,
      userInfo: session?.user ? {
        id: session.user.id,
        username: session.user.username,
        name: session.user.name
      } : null,
      cookies: document.cookie ? document.cookie.split(';').map(c => c.trim()) : []
    }
    console.log("Profile page debug info:", debug)
    setDebugInfo(debug)
  }, [session, status])

  // Redirect unauthenticated users
  useEffect(() => {
    if (isClient && status === "unauthenticated" && !isRefreshing) {
      console.log("User is unauthenticated, redirecting to home")
      router.push("/")
    }
  }, [status, router, isClient, isRefreshing])

  // Show loading state
  if (status === "loading" || !isClient || isRefreshing) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  // If no session data, show loading
  if (!session?.user) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  console.log("Rendering profile for user:", session.user.username)
  const user = session.user

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="card">
        <div className="border-b border-x-gray p-4">
          <h1 className="text-xl font-bold">Your X Profile</h1>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="text-center mb-4 md:mb-0 md:w-1/3">
              {user.image && (
                <div className="rounded-full border-2 border-x-gray w-24 h-24 overflow-hidden mx-auto mb-4">
                  <Image 
                    src={user.image} 
                    alt={user.name || "Profile"} 
                    width={96} 
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold">{user.name}</h3>
              {user.username && (
                <p className="text-x-text-muted">@{user.username}</p>
              )}
              {user.username && (
                <a 
                  href={`https://x.com/${user.username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-outline-dark inline-block mt-4 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffff" className="bi bi-x-logo inline-block mr-2" viewBox="0 0 16 16">
                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                  </svg>
                  View Profile
                </a>
              )}
            </div>
            <div className="md:w-2/3">
              {user.description && (
                <div className="mb-6">
                  <h5 className="font-bold mb-2">Bio</h5>
                  <p>{user.description}</p>
                </div>
              )}
              
              <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4">
                <h5 className="font-bold flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill mr-2" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  Successfully Authenticated
                </h5>
                <p>You have successfully logged in with X OAuth 2.0.</p>
              </div>
              
              {debugInfo && (
                <div className="mt-6 bg-gray-900/20 border border-gray-900/30 rounded-lg p-4">
                  <h5 className="font-bold mb-2">Debug Information</h5>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                  <button 
                    onClick={async () => {
                      setIsRefreshing(true);
                      await refreshSession();
                      setIsRefreshing(false);
                    }}
                    className="btn-outline-dark text-sm mt-2"
                  >
                    Refresh Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-x-gray p-4 flex justify-between items-center">
          <span className="text-x-text-muted text-sm">ID: {user.id}</span>
          <button
            onClick={() => signOut()}
            className="btn-outline-dark text-sm border border-red-600 text-red-500 hover:bg-red-900/20"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
} 