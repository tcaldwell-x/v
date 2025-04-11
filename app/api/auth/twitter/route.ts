import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Define the Twitter OAuth 2.0 endpoint
const TWITTER_OAUTH_URL = 'https://twitter.com/i/oauth2/authorize';

// Helper function to generate a code verifier for PKCE
function generateCodeVerifier(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

// Helper function to generate a code challenge from a code verifier
function generateCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest();
  return Buffer.from(hash).toString('base64url');
}

// Define the routes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const error = searchParams.get('error');
  
  // Check for error 
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }
  
  // Handle sign in
  if (action === 'signin') {
    // Check if environment variables are set
    const missingVars = [];
    if (!process.env.X_CLIENT_ID) missingVars.push('X_CLIENT_ID');
    if (!process.env.X_CLIENT_SECRET) missingVars.push('X_CLIENT_SECRET');
    if (!process.env.NEXTAUTH_URL) missingVars.push('NEXTAUTH_URL');
    if (!process.env.NEXTAUTH_SECRET) missingVars.push('NEXTAUTH_SECRET');
    
    if (missingVars.length > 0) {
      console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      return NextResponse.json({ 
        error: `Authentication configuration error. Missing environment variables: ${missingVars.join(', ')}. Please check your .env.local file.` 
      }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Generate a random state value for CSRF protection
    const generatedState = Math.random().toString(36).substring(2, 15);
    
    // Store the state and code verifier in cookies for validation
    const response = NextResponse.redirect(
      `${TWITTER_OAUTH_URL}?response_type=code&client_id=${process.env.X_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        `${process.env.NEXTAUTH_URL}/api/auth/callback`
      )}&scope=tweet.read%20users.read%20offline.access&state=${generatedState}&code_challenge=${codeChallenge}&code_challenge_method=S256`
    );
    
    // Set cookies with secure options
    response.cookies.set('twitter_oauth_state', generatedState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
      sameSite: 'lax'
    });
    
    response.cookies.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // Handle any invalid requests
  return NextResponse.redirect(new URL('/', request.url));
}

// Handle the sign out process
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'signout') {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('session');
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { 
    status: 400,
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 