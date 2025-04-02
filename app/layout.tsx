import './globals.css'
import type { Metadata } from 'next'
import { TwitterAuthProvider } from './providers'

export const metadata: Metadata = {
  title: 'X OAuth Demo',
  description: 'Next.js application demonstrating OAuth 2.0 authentication with X',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark-theme">
      <body>
        <TwitterAuthProvider>
          <nav className="navbar">
            <div className="container mx-auto p-4">
              <a href="/" className="navbar-brand">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#ffffff" className="bi bi-x-logo" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                </svg>
              </a>
            </div>
          </nav>

          <main className="container mx-auto mt-8 px-4">
            {children}
          </main>

          <footer className="text-center mt-16 p-4 text-x-text-muted">
            <div className="container mx-auto">
              X Developers
            </div>
          </footer>
        </TwitterAuthProvider>
      </body>
    </html>
  )
} 