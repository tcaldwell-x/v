"use client"

import { TwitterAuthProvider } from './providers'

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return <TwitterAuthProvider>{children}</TwitterAuthProvider>
} 