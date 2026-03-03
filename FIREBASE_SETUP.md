# 🔥 Firebase Firestore Integration Guide

## ClaimGrid Insurance Platform - Real-Time Claims System

This guide will help you set up Firebase Firestore for real-time claim processing between Hospital and Provider portals.

---

## 📋 Prerequisites

- A Google account
- Firebase project created
- Node.js and npm installed

---

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `claimgrid-insurance`
4. Follow the setup wizard
5. Enable Google Analytics (optional)

---

## 🔧 Step 2: Set Up Firestore Database

1. In Firebase Console, navigate to **Build** → **Firestore Database**
2. Click "Create Database"
3. Choose **Start in test mode** (for development)
4. Select a Cloud Firestore location (choose closest to you)
5. Click "Enable"

---

## 🔑 Step 3: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the Web icon `</>`
4. Register your app with nickname: `ClaimGrid Web`
5. Copy the Firebase configuration object

---

## ⚙️ Step 4: Configure Your Application

1. Open `src/firebase.js`
2. Replace the configuration with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 📦 Step 5: Install Firebase SDK

```bash
npm install firebase
```

---

## 🔒 Step 6: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the default rules with the content from `firestore.rules`
3. Click **Publish**

For development, use the open rules in `firestore.rules`.

**⚠️ IMPORTANT:** Before going to production, switch to the production rules (commented in the file).

---

## 📊 Step 7: Create Firestore Collection

The collection will be created automatically when the first claim is submitted.

Collection name: `claims`

Document structure:
```javascript
{
  patientName: string,
  policyId: string,
  hospitalId: string,
  hospitalName: string,
  amount: number,
  diagnosis: string,
  status: "Pending" | "Approved" | "Rejected" | "Under Review",
  fraudProbability: number | null,
  riskLevel: string | null,
  finalDecision: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🧪 Step 8: Test the Integration

### Test Hospital Portal (Claim Submission)

1. Start your app: `npm run dev`
2. Navigate to Hospital Portal
3. Login as Hospital
4. Click "Raise New Claim"
5. Fill out the form with patient UID and claim amount
6. Submit the claim
7. Check Firebase Console → Firestore Database to see the new document

### Test Provider Portal (Real-Time Updates)

1. Open a second browser window
2. Navigate to Provider Portal
3. Login as Provider
4. Go to "Claim Queue" section
5. You should see the claim appear instantly
6. Try approving or rejecting the claim
7. Watch the status update in real-time
8. Check Firebase Console to see the updated document

### Test Real-Time Sync

1. Keep both Hospital and Provider portals open side-by-side
2. Submit a new claim from Hospital
3. Watch it appear instantly in Provider's Claim Queue
4. Approve/Reject from Provider
5. The status should update everywhere automatically

---

## 🎯 Features Implemented

### Hospital Portal (`src/pages/Hospital.jsx`)
- ✅ Submit claims to Firestore using `raiseClaim()`
- ✅ Automatic timestamp generation
- ✅ Status set to "Pending"
- ✅ Patient data integration
- ✅ Success confirmation with Firebase document ID

### Provider Portal (`src/pages/ProviderDashboard.jsx`)
- ✅ Real-time claim subscription using `onSnapshot`
- ✅ Live updates when hospitals submit claims
- ✅ Live updates when claims are approved/rejected
- ✅ Approve button with `approveClaim()`
- ✅ Reject button with `rejectClaim()` (with optional reason)
- ✅ Mark as "Under Review" with `markClaimUnderReview()`
- ✅ Status badges with color coding
- ✅ Risk level display
- ✅ Action buttons that disable while processing

### Claim Service (`src/services/claimService.js`)
- ✅ `raiseClaim()` - Create new claim
- ✅ `subscribeToRealTimeClaims()` - Real-time subscription
- ✅ `approveClaim()` - Approve a claim
- ✅ `rejectClaim()` - Reject a claim with reason
- ✅ `markClaimUnderReview()` - Update status
- ✅ `updateClaimWithMLResult()` - ML integration ready
- ✅ `getClaimsByHospital()` - Query by hospital
- ✅ `subscribeToClaimUpdates()` - Subscribe to specific claim

---

## 🤖 Optional: ML Integration

To integrate ML fraud detection:

```javascript
import { updateClaimWithMLResult } from './services/claimService';

// After getting ML prediction
const mlResult = {
  fraudProbability: 0.75,
  riskLevel: "HIGH_RISK",
  finalDecision: "REJECTED",
  status: "Under Review"
};

await updateClaimWithMLResult(claimId, mlResult);
```

---

## 🔐 Production Deployment Checklist

Before deploying to production:

- [ ] Switch to production Firestore security rules
- [ ] Enable Firebase Authentication
- [ ] Add user role verification
- [ ] Implement proper error boundaries
- [ ] Add rate limiting
- [ ] Set up Firebase budget alerts
- [ ] Enable Firestore backup
- [ ] Add monitoring and logging
- [ ] Review and test all security rules
- [ ] Use environment variables for sensitive data

---

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Check that `firebase.js` is properly configured
- Ensure Firebase SDK is installed: `npm install firebase`

### "Permission denied" error
- Check Firestore security rules
- Make sure you're in test mode for development
- Verify the collection name is "claims"

### Claims not appearing in real-time
- Check browser console for errors
- Verify Firebase configuration
- Ensure `subscribeToRealTimeClaims()` is called in useEffect
- Check that cleanup (unsubscribe) is happening properly

### Cannot find module 'firebase'
```bash
npm install firebase
```

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

## 💡 Tips

1. **Use Chrome DevTools** → Application → IndexedDB to see Firestore cache
2. **Firebase Console** → Firestore Database shows real-time updates
3. **Enable offline persistence** for better UX (see Firebase docs)
4. **Use Firestore emulator** for local development (recommended)

---

## 📞 Support

For issues, check:
1. Browser console for errors
2. Firebase Console → Firestore → Data
3. Network tab in DevTools

---

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Claims appear in Firebase Console immediately after submission
- ✅ Provider portal shows claims without page refresh
- ✅ Status updates propagate to all open windows instantly
- ✅ No errors in browser console
- ✅ Live connection indicator is active in Provider portal

---

**🎉 Congratulations! Your real-time insurance claim system is now live!**
