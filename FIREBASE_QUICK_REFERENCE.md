# 🔥 Firebase Integration - Quick Reference

## Installation

```bash
npm install firebase
```

---

## 1️⃣ Firebase Configuration (`src/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
```

---

## 2️⃣ Hospital Portal - Submit Claim

```javascript
import { raiseClaim } from '../services/claimService';

const handleSubmitClaim = async (e) => {
  e.preventDefault();
  
  try {
    const claimData = {
      patientName: patientData.name,
      policyId: formData.patientUid,
      hospitalId: 'HOSP-001',
      hospitalName: 'General Hospital',
      amount: parseFloat(formData.claimAmount),
      diagnosis: formData.diagnosis
    };

    const claimId = await raiseClaim(claimData);
    console.log('✅ Claim created:', claimId);
    alert('Claim submitted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Failed to submit claim');
  }
};
```

---

## 3️⃣ Provider Portal - Real-Time Subscription

```javascript
import { 
  subscribeToRealTimeClaims, 
  approveClaim, 
  rejectClaim 
} from '../services/claimService';

function ProviderDashboard() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToRealTimeClaims((updatedClaims) => {
      console.log('📥 Real-time update:', updatedClaims);
      setClaims(updatedClaims);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const handleApprove = async (claimId) => {
    try {
      await approveClaim(claimId);
      alert('✅ Claim approved!');
    } catch (error) {
      alert('❌ Failed to approve claim');
    }
  };

  const handleReject = async (claimId) => {
    try {
      await rejectClaim(claimId, 'Optional reason');
      alert('✅ Claim rejected!');
    } catch (error) {
      alert('❌ Failed to reject claim');
    }
  };

  return (
    <div>
      {claims.map(claim => (
        <div key={claim.id}>
          <h3>{claim.patientName}</h3>
          <p>Amount: ₹{claim.amount}</p>
          <p>Status: {claim.status}</p>
          
          {claim.status === 'Pending' && (
            <>
              <button onClick={() => handleApprove(claim.id)}>
                Approve
              </button>
              <button onClick={() => handleReject(claim.id)}>
                Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 4️⃣ ML Integration (Optional)

```javascript
import { updateClaimWithMLResult } from '../services/claimService';

// After running ML model
const mlResult = {
  fraudProbability: 0.75,
  riskLevel: 'HIGH_RISK',
  finalDecision: 'REJECTED',
  status: 'Under Review'
};

await updateClaimWithMLResult(claimId, mlResult);
```

---

## 5️⃣ Claim Service Functions

### Available Functions:

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `raiseClaim(claimData)` | Create new claim | Object | Promise<string> (claimId) |
| `subscribeToRealTimeClaims(callback)` | Listen to all claims | Function | Unsubscribe function |
| `approveClaim(claimId)` | Approve a claim | String | Promise<void> |
| `rejectClaim(claimId, reason)` | Reject a claim | String, String | Promise<void> |
| `markClaimUnderReview(claimId)` | Set status to Under Review | String | Promise<void> |
| `updateClaimWithMLResult(claimId, mlResult)` | Update with ML data | String, Object | Promise<void> |
| `getClaimsByHospital(hospitalId)` | Get claims by hospital | String | Promise<Array> |

---

## 6️⃣ Firestore Document Structure

```javascript
{
  id: "auto-generated-id",
  patientName: "John Doe",
  policyId: "ACK210001",
  hospitalId: "HOSP-001",
  hospitalName: "Apollo Hospital",
  amount: 50000,
  diagnosis: "Fever",
  status: "Pending", // Pending | Approved | Rejected | Under Review
  fraudProbability: 0.15, // 0-1 or null
  riskLevel: "LOW_RISK", // or null
  finalDecision: "APPROVED", // or null
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 7️⃣ Firestore Security Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /claims/{claimId} {
      allow read, write: if true;
    }
  }
}
```

---

## 🎨 Example: Display Claims in Table

```jsx
<table>
  <thead>
    <tr>
      <th>Patient</th>
      <th>Amount</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {claims.map(claim => (
      <tr key={claim.id}>
        <td>{claim.patientName}</td>
        <td>₹{claim.amount.toLocaleString()}</td>
        <td>
          <span className={
            claim.status === 'Approved' ? 'text-green-600' :
            claim.status === 'Rejected' ? 'text-red-600' :
            'text-yellow-600'
          }>
            {claim.status}
          </span>
        </td>
        <td>
          {claim.status === 'Pending' && (
            <>
              <button onClick={() => handleApprove(claim.id)}>
                ✓ Approve
              </button>
              <button onClick={() => handleReject(claim.id)}>
                ✗ Reject
              </button>
            </>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 🔍 Debugging Tips

```javascript
// Log all claims in real-time
subscribeToRealTimeClaims((claims) => {
  console.table(claims);
});

// Check Firestore connection
import { getFirestore } from 'firebase/firestore';
console.log('Firestore instance:', getFirestore());

// Monitor specific claim
import { subscribeToClaimUpdates } from '../services/claimService';
subscribeToClaimUpdates(claimId, (claim) => {
  console.log('Claim updated:', claim);
});
```

---

## ⚡ Performance Tips

1. **Limit queries**: Use `limit()` to restrict results
2. **Use indexes**: Create indexes for complex queries
3. **Paginate**: Implement pagination for large datasets
4. **Clean up**: Always return unsubscribe functions

```javascript
useEffect(() => {
  const unsubscribe = subscribeToRealTimeClaims(setClaims);
  return () => unsubscribe(); // ✅ Clean up
}, []);
```

---

## 🚨 Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Firebase: No Firebase App '[DEFAULT]' has been created" | Check firebase.js is imported and initialized |
| "FirebaseError: Missing or insufficient permissions" | Update Firestore security rules |
| "Module not found: Can't resolve 'firebase'" | Run `npm install firebase` |
| Claims not updating in real-time | Check onSnapshot subscription and cleanup |

---

## 📱 Testing Checklist

- [ ] Install Firebase: `npm install firebase`
- [ ] Configure `src/firebase.js` with your credentials
- [ ] Deploy Firestore security rules
- [ ] Test claim submission from Hospital portal
- [ ] Verify claim appears in Firebase Console
- [ ] Test real-time updates in Provider portal
- [ ] Test approve/reject actions
- [ ] Test with multiple browser windows
- [ ] Check browser console for errors
- [ ] Verify status updates propagate

---

**✅ Your real-time claim system is ready!**
