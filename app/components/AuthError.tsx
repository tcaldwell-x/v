"use client"

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ErrorMessages {
  [key: string]: string;
}

const errorMessages: ErrorMessages = {
  invalid_state: "Security verification failed. Please try signing in again.",
  token_exchange_error: "Could not complete the authentication with X. Please try again.",
  user_fetch_error: "Could not fetch your profile information. Please try again.",
  missing_code: "Authentication code missing. Please try signing in again.",
  authentication_error: "An error occurred during authentication. Please try again.",
  default: "An unknown error occurred. Please try again."
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);
  
  if (!error) return null;
  
  const errorMessage = errorMessages[error] || errorMessages.default;
  
  return (
    <div className="mb-8 bg-red-900/20 border border-red-900/30 rounded-lg p-4 w-full max-w-md mx-auto">
      <h5 className="font-bold flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle-fill mr-2" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
        </svg>
        Authentication Error
      </h5>
      <p>{errorMessage}</p>
    </div>
  );
} 