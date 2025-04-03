"use client"

import { useTwitterAuth } from "./providers"
import { useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import AuthError from "./components/AuthError"

export default function Home() {
  const { session, status, signIn } = useTwitterAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/profile")
    }
  }, [session, status, router])

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">OAuth2.0 Demo</h1>
      <p className="text-x-text-muted mb-12">Authenticate with your X account using OAuth 2.0</p>

      <Suspense fallback={<div>Loading...</div>}>
        <AuthError />
      </Suspense>

      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#ffffff" className="bi bi-x-logo mb-4 mx-auto" viewBox="0 0 16 16">
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
          </svg>
          <p className="mb-6 text-x-text-muted">Connect your X account to view your profile information.</p>
          <button 
            onClick={() => signIn()}
            className="btn-primary px-8 py-3 flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-logo mr-2" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
            </svg>
            Sign in with X
          </button>
        </div>
      </div>
    </div>
  )
} 