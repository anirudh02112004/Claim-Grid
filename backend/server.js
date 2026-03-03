require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 8000;

// Hardcoded Client ID as fallback (same as frontend)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '404398181144-m0kdl7f0t58muk4mogr2v3p3f0h03rnp.apps.googleusercontent.com';

// Debug: Check if environment variables are loaded
console.log('🔑 Google Client ID loaded:', process.env.GOOGLE_CLIENT_ID ? 'YES (from .env)' : 'NO (using hardcoded fallback)');
console.log('Client ID starts with:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

// Google OAuth2 Client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Google OAuth Login Route
app.post('/auth/google', async (req, res) => {
  const { token, role } = req.body;

  console.log('📥 Received auth request for role:', role);
  console.log('🔑 Backend expecting Client ID:', GOOGLE_CLIENT_ID);

  try {
    // Verify the Google token
    console.log('🔍 Verifying Google token...');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Token verified for email:', payload.email);
    console.log('Token was issued for audience (aud):', payload.aud);

    // Create user data
    const userData = {
      id: `google-${role}-${Date.now()}`,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: role,
      isGuest: false,
    };

    // 🔹 TODO: Save to database if new user
    // Example:
    // const existingUser = await User.findOne({ email: payload.email });
    // if (!existingUser) {
    //    await User.create(userData);
    // }

    console.log('✅ User logged in:', userData);

    res.json({
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    console.error('Error details:', error);
    res.status(401).json({ 
      error: 'Invalid token or authentication failed',
      details: error.message 
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Dashboard API endpoint
app.get('/api/provider/dashboard', (req, res) => {
  // Example response data
  const dashboardData = {
    claimsUnderReview: 1284,
    pendingDecisions: 85,
    avgApprovalDays: 4.2,
    portfolioRiskScore: "LOW",
  };

  res.json(dashboardData);
});

// Start server
app.listen(PORT, () => {
  console.log('\n===========================================');
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('🔑 Using Client ID:', GOOGLE_CLIENT_ID.substring(0, 30) + '...');
  console.log('===========================================\n');
});
