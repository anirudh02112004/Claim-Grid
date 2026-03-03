import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// Hardcoded Client ID as fallback
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '404398181144-m0kdl7f0t58muk4mogr2v3p3f0h03rnp.apps.googleusercontent.com';

// Debug: Log client ID status (remove in production)
if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  console.error('⚠️ VITE_GOOGLE_CLIENT_ID is not set in .env file! Using fallback.');
} else {
  console.log('✅ Google Client ID loaded from .env');
}
console.log('Client ID being used:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
