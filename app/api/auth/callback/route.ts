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
  
  // Check if environment variables are set
  if (!process.env.X_CLIENT_ID || !process.env.X_CLIENT_SECRET || !process.env.NEXTAUTH_URL) {
    console.error('Missing required environment variables: X_CLIENT_ID, X_CLIENT_SECRET, or NEXTAUTH_URL');
    return NextResponse.json({ 
      error: 'Authentication configuration error. Please check server logs.' 
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
        code_verifier: 'challenge', // In a real implementation, you should use PKCE
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
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
      console.error('User data fetch error:', await userResponse.text());
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
    
    // Set the session data in a cookie
    const response = NextResponse.redirect(new URL('/profile', request.url));
    response.cookies.set('twitter_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Clear the state cookie since we no longer need it
    response.cookies.delete('twitter_oauth_state');
    
    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(new URL('/?error=authentication_error', request.url));
  }
} 