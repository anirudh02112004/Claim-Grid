# ClaimGrid Backend - Google OAuth

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Edit `backend/.env` and add your Google Client ID:
```
PORT=8000
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 3. Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Select "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5175`
   - `http://localhost:5173`
7. Add authorized redirect URIs:
   - `http://localhost:5175`
   - `http://localhost:5173`
8. Copy the Client ID

### 4. Update Frontend .env
Update `.env` in the root folder:
```
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 5. Run Backend Server
```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:8000

### 6. Test the Server
```bash
curl http://localhost:8000/health
```

## API Endpoints

### POST /auth/google
Verify Google OAuth token and authenticate user

**Request:**
```json
{
  "token": "google_id_token",
  "role": "hospital" | "provider" | "patient"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "google-hospital-1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://...",
    "role": "hospital",
    "isGuest": false
  }
}
```

## Database Integration (TODO)
To save users to database, uncomment the database code in `server.js` and:
1. Install database package (mongoose for MongoDB, pg for PostgreSQL, etc.)
2. Create User model
3. Add database connection
4. Implement user lookup and creation

## Production Deployment
For production:
1. Add your production domain to Google Console authorized origins
2. Use HTTPS
3. Store GOOGLE_CLIENT_ID in secure environment variables
4. Implement JWT for session handling
5. Add rate limiting and security middleware
