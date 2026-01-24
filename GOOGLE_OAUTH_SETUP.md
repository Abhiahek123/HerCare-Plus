# 🔐 Google OAuth Setup Guide for HerCare+

## 📋 What You Need to Do in Google Cloud Console

### Step 1: Create OAuth 2.0 Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one called "HerCare Plus")

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (for testing with any Google account)
   - Fill in:
     - **App name**: HerCare+
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (we'll add minimal scopes)
   - Add test users (your email) if in testing mode
   - Click "Save and Continue"

4. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: **HerCare+ Web Client**

   **IMPORTANT - Authorized redirect URIs:**

   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.vercel.app/api/auth/callback/google
   ```

5. **Copy Your Credentials**
   - You'll get a **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - And a **Client Secret** (looks like: `GOCSPX-abc123xyz`)
   - **Save these!** You'll need them in the next step.

---

## 🔑 Step 2: Add to Your `.env.local` File

Create a file called `.env.local` in your project root with:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here_generate_with_openssl
```

**To generate NEXTAUTH_SECRET**, run this in terminal:

```bash
openssl rand -base64 32
```

---

## 📍 Redirect URLs Summary

### For Development (localhost):

```
http://localhost:3000/api/auth/callback/google
```

### For Production (Vercel):

```
https://hercare-plus.vercel.app/api/auth/callback/google
```

**Replace `hercare-plus` with your actual Vercel domain!**

---

## 🎯 What Scopes We Request

We only request **minimal scopes**:

- `openid` - Basic authentication
- `email` - User's email address
- `profile` - User's name and profile picture

**We do NOT request:**

- ❌ Google Drive access
- ❌ Calendar access
- ❌ Contacts access
- ❌ Any other sensitive data

---

## 🔒 Privacy Guarantee

When a user signs in with Google:

1. We only get their **email** and **name**
2. We create a **secure account** in our database
3. Their **health data** is stored separately and encrypted
4. Google **never sees** their cycle data, symptoms, or any health information

---

## 🚀 Testing the Flow

After setup:

1. Click "Continue with Google" on `/signin`
2. You'll be redirected to Google's consent screen
3. After approval, you'll be redirected back to HerCare+
4. You'll be logged in and can use the app

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

- **Fix**: Make sure the redirect URI in Google Console exactly matches:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
  (No trailing slash!)

### Error: "invalid_client"

- **Fix**: Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct in `.env.local`

### Error: "Access blocked: This app's request is invalid"

- **Fix**: Make sure you've enabled the Google+ API and configured the OAuth consent screen

---

## 📝 Quick Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Added redirect URIs (localhost + production)
- [ ] Copied Client ID and Secret
- [ ] Created `.env.local` file
- [ ] Added credentials to `.env.local`
- [ ] Generated NEXTAUTH_SECRET
- [ ] Restarted dev server (`npm run dev`)

---

## 🎓 Next Steps

After Google OAuth is working:

1. Test the sign-in flow
2. Verify user data is stored correctly
3. Deploy to Vercel
4. Add production redirect URI to Google Console
5. Update `NEXTAUTH_URL` in Vercel environment variables

**You're building a production-ready, privacy-first authentication system! 🛡️**
