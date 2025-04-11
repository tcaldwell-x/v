import { NextRequest, NextResponse } from 'next/server';
import { TwitterTokenResponse, TwitterUserData } from '../../../types';

// Define the Twitter OAuth 2.0 endpoints
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_USER_URL = 'https://api.twitter.com/2/users/me';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Check for error from Twitter
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }
  
  // Validate the required code parameter
  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url));
  }
  
  // Validate the state parameter to prevent CSRF attacks
  const storedState = request.cookies.get('twitter_oauth_state')?.value;
  if (storedState !== state) {
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url));
  }
  
  // Get the code verifier from cookies
  const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/?error=missing_code_verifier', request.url));
  }
  
  // Check if environment variables are set
  const missingVars = [];
  if (!process.env.X_CLIENT_ID) missingVars.push('X_CLIENT_ID');
  if (!process.env.X_CLIENT_SECRET) missingVars.push('X_CLIENT_SECRET');
  if (!process.env.NEXTAUTH_URL) missingVars.push('NEXTAUTH_URL');
  
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
  
  try {
    // Exchange the authorization code for access tokens
    const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
        code_verifier: codeVerifier,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      return NextResponse.redirect(new URL('/?error=token_exchange_error', request.url));
    }
    
    const tokenData = await tokenResponse.json() as TwitterTokenResponse;
    
    // Fetch the user profile with the access token
    const userResponse = await fetch(TWITTER_USER_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-type': 'application/json',
      }
    });
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User data fetch error:', errorText);
      return NextResponse.redirect(new URL('/?error=user_fetch_error', request.url));
    }
    
    const userData = await userResponse.json() as TwitterUserData;
    
    // Create our session data
    const sessionData = {
      user: {
        id: userData.data.id,
        name: userData.data.name,
        username: userData.data.username,
        image: userData.data.profile_image_url,
        description: userData.data.description,
      },
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };
    
    console.log("Created session data:", {
      userId: sessionData.user.id,
      username: sessionData.user.username,
      expiresAt: new Date(sessionData.expiresAt).toISOString()
    });
    
    // Get the hostname from the request URL
    const hostname = new URL(request.url).hostname;
    console.log("Setting cookie for hostname:", hostname);
    
    // Set the session data in a cookie
    const response = NextResponse.redirect(new URL('/profile', request.url));
    
    // Set the session cookie with proper domain and path
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax' as const,
      // Don't set domain for localhost, but set it for production
      ...(process.env.NODE_ENV === 'production' ? { domain: hostname } : {})
    };
    
    console.log("Setting session cookie with options:", cookieOptions);
    response.cookies.set('session', JSON.stringify(sessionData), cookieOptions);
    
    // Clear the OAuth cookies since we no longer need them
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_code_verifier');
    
    console.log("Redirecting to profile page");
    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(new URL('/?error=authentication_error', request.url));
  }
} 