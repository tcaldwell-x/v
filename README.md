# X OAuth2.0 Demo with Vanilla JavaScript/TypeScript


This Next.js application demonstrates how to implement OAuth 2.0 authentication with X (formerly Twitter) using vanilla JavaScript/TypeScript without relying on third-party authentication libraries.

## Features

- Complete OAuth 2.0 Authorization Code Flow implementation
- Clean and type-safe TypeScript implementation
- Session management with HTTP cookies
- Profile information display
- CSRF protection with state parameter
- Error handling

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your X API credentials:
   ```
   X_CLIENT_ID=your_client_id
   X_CLIENT_SECRET=your_client_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/app/api/auth/twitter`: Twitter OAuth initiation endpoint
- `/app/api/auth/callback`: OAuth callback endpoint
- `/app/api/auth/session`: Session management endpoint
- `/app/providers.tsx`: React context for auth state management
- `/app/components/AuthError.tsx`: Error handling component
- `/app/types.ts`: TypeScript type definitions

## How It Works

1. **Authentication Flow**:
   - User clicks "Sign in with X" button
   - The app redirects to X's OAuth authorization page
   - After authorizing, X redirects back to our callback URL
   - We exchange the authorization code for access tokens
   - User profile information is fetched and stored in a session cookie

2. **Session Management**:
   - Session data is stored in an HTTP-only cookie
   - The React context provides session state to components
   - Session expiration is handled automatically

3. **Security Features**:
   - CSRF protection using state parameter
   - HTTP-only cookies for token storage
   - Secure cookie settings in production

## OAuth 2.0 Implementation Details

This implementation follows the OAuth 2.0 Authorization Code Flow:

1. **Authorization Request**:
   ```
   GET https://twitter.com/i/oauth2/authorize
   ?response_type=code
   &client_id={client_id}
   &redirect_uri={redirect_uri}
   &scope=tweet.read users.read offline.access
   &state={random_state}
   ```

2. **Token Exchange**:
   ```
   POST https://api.twitter.com/2/oauth2/token
   Authorization: Basic {base64_encoded_client_credentials}
   Content-Type: application/x-www-form-urlencoded
   
   code={code}
   &grant_type=authorization_code
   &redirect_uri={redirect_uri}
   &code_verifier={code_verifier}
   ```

3. **User Profile Fetch**:
   ```
   GET https://api.twitter.com/2/users/me
   Authorization: Bearer {access_token}
   ```

## License

ISC 
