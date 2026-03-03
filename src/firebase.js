// Firebase v9 Modular SDK Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZa18sHnxGx5M_AfeXvmuV6faxFjF7Nq4",
  authDomain: "claimgrid-d8c2e.firebaseapp.com",
  projectId: "claimgrid-d8c2e",
  storageBucket: "claimgrid-d8c2e.firebasestorage.app",
  messagingSenderId: "500172154593",
  appId: "1:500172154593:web:66fbc5ce8fab41d5ddf9a0",
  measurementId: "G-51V4H8XSP9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (optional, for future authentication)
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
