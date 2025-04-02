"use client"

import ErrorCard from "./components/ErrorCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorCard message={error.message || "An unexpected error occurred."} />
  )
} 