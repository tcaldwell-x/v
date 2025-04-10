import { NextRequest, NextResponse } from 'next/server';
import { TwitterSession } from '../../../types';
import { cookies } from 'next/headers';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
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
      
      // Check if session is expired
      if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
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
        response.cookies.delete('session');
        return response;
      }

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
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
} 