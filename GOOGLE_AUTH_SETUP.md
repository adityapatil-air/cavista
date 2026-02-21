# Google Authentication Setup Guide

## 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Select **Web application** as application type
7. Add authorized redirect URIs:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (for local development)
8. Copy the **Client ID** and **Client Secret**

## 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** and enable it
5. Paste your Google **Client ID** and **Client Secret**
6. Save the configuration

## 3. Test the Integration

1. Start your development server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected to the dashboard

## Features Added

✅ Google OAuth login button on Login page
✅ Google OAuth signup button on SignUp page
✅ Automatic redirect to dashboard after authentication
✅ Session management with Supabase

## Notes

- Users authenticated via Google will be automatically created in your Supabase users table
- The email from Google account will be used as the user's email
- No password is stored for Google-authenticated users
