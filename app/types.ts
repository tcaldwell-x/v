// Twitter User and Session types
export interface TwitterUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  description?: string;
}

export interface TwitterSession {
  user: TwitterUser;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Twitter API response types
export interface TwitterTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}

export interface TwitterUserData {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    description?: string;
  }
} 