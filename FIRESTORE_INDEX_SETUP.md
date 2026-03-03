# 🔥 Firestore Index Setup Guide

## Problem: Claims Not Showing After Submission

If you're seeing errors like "The query requires an index" in the browser console, follow these steps:

## 📋 Quick Fix

### Option 1: Automatic Index Creation (Recommended)

1. **Open Browser Console (F12)**
2. **Look for this error:**
   ```
   Firebase: The query requires an index. You can create it here: https://console.firebase.google.com/...
   ```
3. **Click the link** - It will auto-create the index
4. **Wait 2-5 minutes** for the index to build
5. **Refresh the hospital page**

### Option 2: Manual Index Creation

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/claimgrid-d8c2e/firestore/indexes
   ```

2. **Click "Create Index"**

3. **Configure the index:**
   - **Collection ID:** `claims`
   - **Fields to index:**
     - Field: `hospitalId` | Order: `Ascending`
     - Field: `createdAt` | Order: `Descending`
   - **Query scope:** Collection

4. **Click "Create Index"**

5. **Wait for index to build** (usually 2-5 minutes)

## 🧪 Testing Steps

1. **Open hospital dashboard**
2. **Open browser console (F12)**
3. **Look for these logs:**
   ```
   🔥 Setting up Firebase subscription for hospital: HOSP-GUEST-001
   📦 Firestore snapshot received: X documents
   ```

4. **Raise a test claim:**
   - Click "+ Raise New Claim"
   - Enter Patient UID (e.g., P001)
   - Fill claim details
   - Submit

5. **Check console logs:**
   ```
   🏥 Hospital submitting claim: {hospitalId: ..., hospitalName: ...}
   ✅ Claim raised to Firebase with ID: ...
   📥 Received hospital claims update: 1 claims
   ```

## 🔍 Common Issues

### Issue 1: "No documents found"
**Cause:** HospitalId mismatch
**Fix:** Check console logs:
- Submitting claim with hospitalId: `HOSP-XXXX`
- Subscription listening for: `HOSP-YYYY`
- **They must match!**

### Issue 2: "Missing index"
**Cause:** Firestore composite index not created
**Fix:** Follow Option 1 or 2 above

### Issue 3: Claims show in Firestore but not in UI
**Cause:** Real-time listener not working
**Fix:** 
1. Check Firestore rules allow read: `allow read: if true;`
2. Check browser console for subscription errors
3. Try logout/login again

## 🎯 Verify Claims in Firestore Console

1. **Go to Firestore Database:**
   ```
   https://console.firebase.google.com/project/claimgrid-d8c2e/firestore/data
   ```

2. **Navigate to:** `claims` collection

3. **Check documents:**
   - Look for `hospitalId` field
   - Verify it matches your logged-in hospital ID
   - Check `status` field is "Pending"

## 📊 Expected Behavior

✅ **Working correctly when:**
- Hospital raises claim → Shows success message
- Claim appears instantly in "Recent Claims" table
- Stats update (Total Claims increases by 1)
- Provider dashboard also shows the claim
- Status badge shows "Pending" (yellow)

❌ **Not working when:**
- Loading spinner never stops
- Table shows "No claims available" after submission
- Console shows index errors
- Stats don't update

## 🚀 Quick Test Command

Run this in browser console to check Firebase connection:
```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

getDocs(collection(db, 'claims')).then(snapshot => {
  console.log('Total claims in Firestore:', snapshot.size);
  snapshot.forEach(doc => console.log(doc.id, doc.data()));
});
```

## 💡 Need Help?

If issues persist, share these console logs:
1. 🔥 Setting up Firebase subscription logs
2. 📦 Firestore snapshot logs
3. ❌ Any error messages
4. 🏥 Hospital claims update logs
