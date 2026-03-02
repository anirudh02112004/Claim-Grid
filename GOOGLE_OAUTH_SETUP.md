# Google OAuth Setup Guide for ClaimGrid

## ✅ What Has Been Implemented

### Frontend Changes
1. ✅ Installed `@react-oauth/google` and `axios` packages
2. ✅ Wrapped app with `GoogleOAuthProvider` in `main.jsx`
3. ✅ Added Google Login button to `Login.jsx`
4. ✅ Implemented role-based redirection (hospital/provider/patient)
5. ✅ Created `.env` file for frontend

### Backend Setup
1. ✅ Created `backend/` folder with Node.js server
2. ✅ Implemented Google OAuth token verification
3. ✅ Created `/auth/google` endpoint
4. ✅ Added CORS support for frontend communication
5. ✅ Created `.env` file for backend

---

## 🚀 Quick Start Guide

### Step 1: Get Google OAuth Credentials

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials:**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add **Authorized JavaScript origins:**
     ```
     http://localhost:5175
     http://localhost:5173
     ```
   - Add **Authorized redirect URIs:**
     ```
     http://localhost:5175
     http://localhost:5173
     ```
   - Click "Create"
5. **Copy your Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)

---

### Step 2: Configure Environment Variables

#### Frontend (.env in root folder)
Edit `.env` in the root directory:
```env
VITE_GOOGLE_CLIENT_ID=paste_your_actual_client_id_here
```

#### Backend (backend/.env)
Edit `backend/.env`:
```env
PORT=8000
GOOGLE_CLIENT_ID=paste_your_actual_client_id_here
```

⚠️ **Important:** Use the SAME Client ID in both files!

---

### Step 3: Install Backend Dependencies

Open a **new terminal** and run:
```bash
cd backend
npm install
```

This will install:
- express
- google-auth-library
- cors
- dotenv

---

### Step 4: Start the Backend Server

In the backend folder:
```bash
npm run dev
```

You should see:
```
🚀 Backend server running on http://localhost:8000
```

Leave this terminal running.

---

### Step 5: Start the Frontend

Open **another terminal** and from the root directory:
```bash
npm run dev
```

Your frontend should be running on `http://localhost:5175` (or 5173)

---

### Step 6: Test Google Login

1. Visit: `http://localhost:5175/login/provider` (or hospital, patient)
2. Click the **"Sign in with Google"** button
3. Select your Google account
4. You should be redirected to the appropriate dashboard

---

## 🔍 How It Works

### Login Flow

```
User clicks Google Login
    ↓
Google Authentication Popup
    ↓
Google returns JWT token
    ↓
Frontend sends token + role to backend (/auth/google)
    ↓
Backend verifies token with Google
    ↓
Backend extracts user info (email, name, picture)
    ↓
Backend sends user data back to frontend
    ↓
Frontend saves to localStorage
    ↓
User redirected based on role:
  - hospital → /hospital
  - provider → /provider
  - patient → /patient
```

---

## 📁 File Structure

```
claimgrid/
├── .env                          # Frontend environment variables
├── src/
│   ├── main.jsx                  # ✅ GoogleOAuthProvider wrapper added
│   └── pages/
│       └── Login.jsx             # ✅ Google Login button added
│
└── backend/
    ├── .env                      # Backend environment variables
    ├── package.json              # Backend dependencies
    ├── server.js                 # Express server with /auth/google
    └── README.md                 # Backend-specific docs
```

---

## 🐛 Troubleshooting

### Issue: "Invalid token" error
**Solution:** Make sure the Client ID in `.env` files matches the one from Google Console

### Issue: CORS error
**Solution:** Backend is running CORS middleware. Ensure backend is running on port 8000

### Issue: "Login Failed" popup
**Solution:** 
1. Check browser console for errors
2. Verify authorized origins in Google Console include your current port
3. Ensure both frontend and backend are running

### Issue: Can't see Google Login button
**Solution:**
1. Restart the dev server after adding `.env`
2. Clear browser cache
3. Check that VITE_GOOGLE_CLIENT_ID is set in `.env`

---

## 🔐 Production Deployment

Before deploying to production:

1. **Update Google Console:**
   - Add your production domain to authorized origins and redirect URIs
   - Example: `https://claimgrid.com`

2. **Use HTTPS:**
   - Google OAuth requires HTTPS in production

3. **Secure Environment Variables:**
   - Use platform environment variables (not .env files)
   - Example: Vercel, Railway, AWS, etc.

4. **Add Database Integration:**
   - Currently, users are not saved to database
   - Uncomment database code in `backend/server.js`
   - Install your database package (MongoDB, PostgreSQL, etc.)

5. **Implement JWT Sessions:**
   - For persistent authentication across requests
   - Install `jsonwebtoken` package

---

## 📞 Support

If you encounter issues:
1. Check backend terminal for error logs
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Ensure both servers are running simultaneously

---

## ✨ Next Steps

- [ ] Add database integration to save users
- [ ] Implement JWT for session management  
- [ ] Add user profile page showing Google profile picture
- [ ] Add logout functionality that clears Google session
- [ ] Add loading states during login process
- [ ] Implement error boundary for better error handling
