import { NextRequest, NextResponse } from 'next/server';
import { TwitterSession } from '../../../types';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { session: null },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      
      // Check if session is expired
      if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
        // Delete the expired session cookie
        const response = NextResponse.json(
          { session: null },
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        response.cookies.delete('session');
        return response;
      }

      return NextResponse.json(
        { session: sessionData },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (parseError) {
      console.error('Error parsing session cookie:', parseError);
      // Delete the corrupted session cookie
      const response = NextResponse.json(
        { session: null },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      response.cookies.delete('session');
      return response;
    }
  } catch (error) {
    console.error('Error in session route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 