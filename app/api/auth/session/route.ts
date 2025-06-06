import { NextRequest, NextResponse } from 'next/server';
import { TwitterSession } from '../../../types';
import { cookies } from 'next/headers';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log("Session API called");
    console.log("Request headers:", Object.fromEntries(request.headers));
    
    // Log the hostname from the request
    const hostname = new URL(request.url).hostname;
    console.log("Request hostname:", hostname);
    
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    console.log("Session cookie found:", !!sessionCookie);
    if (sessionCookie) {
      console.log("Session cookie value length:", sessionCookie.value.length);
    } else {
      // Log all cookies to see what's available
      const allCookies = cookieStore.getAll();
      console.log("All available cookies:", allCookies.map(c => c.name));
    }

    if (!sessionCookie) {
      console.log("No session cookie found, returning null session");
      return new NextResponse(
        JSON.stringify({ session: null }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      console.log("Session data parsed successfully:", {
        userId: sessionData.user?.id,
        username: sessionData.user?.username,
        expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt).toISOString() : null
      });
      
      // Check if session is expired
      if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
        console.log("Session expired at:", new Date(sessionData.expiresAt).toISOString());
        // Delete the expired session cookie
        const response = new NextResponse(
          JSON.stringify({ session: null }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          }
        );
        
        // Delete the cookie
        response.cookies.delete('session');
        
        return response;
      }

      console.log("Returning valid session data");
      return new NextResponse(
        JSON.stringify({ session: sessionData }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    } catch (parseError) {
      console.error('Error parsing session cookie:', parseError);
      // Delete the corrupted session cookie
      const response = new NextResponse(
        JSON.stringify({ session: null }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
      
      // Delete the cookie
      response.cookies.delete('session');
      
      return response;
    }
  } catch (error) {
    console.error('Error in session route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 