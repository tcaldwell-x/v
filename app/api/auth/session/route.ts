import { NextRequest, NextResponse } from 'next/server';
import { TwitterSession } from '../../../types';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = request.cookies.get('twitter_session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ session: null }, { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Parse the session data
    let session: TwitterSession;
    try {
      session = JSON.parse(sessionCookie) as TwitterSession;
    } catch (parseError) {
      console.error('Error parsing session cookie:', parseError);
      // Delete the corrupted session cookie
      const response = NextResponse.json({ session: null }, { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      response.cookies.delete('twitter_session');
      return response;
    }
    
    // Check if the session has expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      // If we have a refresh token, we could implement token refresh here
      // For now, just return null session
      
      // Delete the expired session cookie
      const response = NextResponse.json({ session: null }, { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      response.cookies.delete('twitter_session');
      return response;
    }
    
    // Return the session data (excluding sensitive tokens)
    return NextResponse.json({
      session: {
        user: session.user,
        expiresAt: session.expiresAt
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error getting session:', error);
    
    // Return null session and clear potentially corrupted cookie
    const response = NextResponse.json({ 
      session: null, 
      error: 'Failed to get session' 
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    response.cookies.delete('twitter_session');
    return response;
  }
} 