import { NextRequest, NextResponse } from 'next/server';

// Define the Twitter OAuth 2.0 endpoint
const TWITTER_OAUTH_URL = 'https://twitter.com/i/oauth2/authorize';

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
    if (!process.env.X_CLIENT_ID || !process.env.NEXTAUTH_URL) {
      console.error('Missing required environment variables: X_CLIENT_ID or NEXTAUTH_URL');
      return NextResponse.json({ 
        error: 'Authentication configuration error. Please check server logs.' 
      }, { status: 500 });
    }
    
    // Generate a random state value for CSRF protection
    const generatedState = Math.random().toString(36).substring(2, 15);
    
    // Store the state in cookies for validation
    const response = NextResponse.redirect(
      `${TWITTER_OAUTH_URL}?response_type=code&client_id=${process.env.X_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        `${process.env.NEXTAUTH_URL}/api/auth/callback`
      )}&scope=tweet.read%20users.read%20offline.access&state=${generatedState}`
    );
    
    response.cookies.set('twitter_oauth_state', generatedState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
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
    response.cookies.delete('twitter_session');
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 