require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 8000;

// Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Google OAuth Login Route
app.post('/auth/google', async (req, res) => {
  const { token, role } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

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

    console.log('User logged in:', userData);

    res.json({
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
