# X OAuth2.0 Demo with Vanilla JavaScript/TypeScript


This Next.js application demonstrates how to implement OAuth 2.0 authentication with X (formerly Twitter) using vanilla JavaScript/TypeScript without relying on third-party authentication libraries.

## Features

- Complete OAuth 2.0 Authorization Code Flow implementation
- Clean and type-safe TypeScript implementation
- Session management with HTTP cookies
- Profile information display
- CSRF protection with state parameter
- Error handling

## Environment Variables

This application requires the following environment variables to be set:

- `X_CLIENT_ID`: Your Twitter API client ID
- `X_CLIENT_SECRET`: Your Twitter API client secret
- `NEXTAUTH_URL`: The URL of your deployed application (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET`: A random string used to encrypt cookies (you can generate one with `openssl rand -base64 32`)

## Setting up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" in the top navigation
3. Select "Environment Variables" from the left sidebar
4. Add each of the required environment variables:
   - Name: `X_CLIENT_ID`, Value: Your Twitter API client ID
   - Name: `X_CLIENT_SECRET`, Value: Your Twitter API client secret
   - Name: `NEXTAUTH_URL`, Value: Your Vercel deployment URL (e.g., https://your-app.vercel.app)
   - Name: `NEXTAUTH_SECRET`, Value: A random string for cookie encryption
5. Click "Save" to apply the changes
6. Redeploy your application

## Getting Twitter API Credentials

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project or select an existing one
3. Create a new app or select an existing one
4. Go to the "Keys and Tokens" tab
5. Generate a client ID and client secret
6. Add your callback URL: `https://your-app.vercel.app/api/auth/callback`

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the required environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

## Troubleshooting

If you encounter issues with authentication:

1. Check that all environment variables are correctly set in Vercel
2. Verify that your callback URL is correctly configured in the Twitter Developer Portal
3. Check the Vercel deployment logs for any errors
4. Make sure your Twitter API credentials have the necessary permissions

## License

ISC 
