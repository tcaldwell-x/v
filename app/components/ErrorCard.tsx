"use client"

interface ErrorCardProps {
  message: string;
}

export default function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <div className="border-b border-x-gray p-4">
          <h1 className="text-xl font-bold text-red-500">Error</h1>
        </div>
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
            <h5 className="font-bold flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill mr-2 text-red-500" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              Authentication Error
            </h5>
            <p className="mb-4">{message}</p>
            <a href="/" className="btn-primary inline-block text-sm px-4 py-2">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 