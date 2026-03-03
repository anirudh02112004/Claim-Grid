import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

const CLAIMS_COLLECTION = 'claims';

/**
 * Hospital Portal - Raise a new claim
 * @param {Object} claimData - Claim information
 * @returns {Promise<string>} - Document ID of the created claim
 */
export const raiseClaim = async (claimData) => {
  try {
    const claimDoc = {
      patientName: claimData.patientName,
      policyId: claimData.policyId,
      hospitalId: claimData.hospitalId || 'HOSP-001',
      hospitalName: claimData.hospitalName || 'Unknown Hospital',
      amount: Number(claimData.amount),
      diagnosis: claimData.diagnosis || '',
      status: 'Pending',
      fraudProbability: null,
      riskLevel: null,
      finalDecision: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, CLAIMS_COLLECTION), claimDoc);
    console.log('✅ Claim raised successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error raising claim:', error);
    throw error;
  }
};

/**
 * Provider Portal - Subscribe to real-time claims updates
 * @param {Function} callback - Function to call when claims update
 * @param {String} statusFilter - Optional status filter ('Pending', 'Approved', etc.)
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToRealTimeClaims = (callback, statusFilter = null) => {
  try {
    console.log('🔍 Setting up provider real-time claims subscription');
    
    let q = query(
      collection(db, CLAIMS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    // Add status filter if provided
    if (statusFilter) {
      q = query(
        collection(db, CLAIMS_COLLECTION),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📦 Provider received:', snapshot.size, 'claims');
        
        const claims = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        });
        
        console.log('🔄 Real-time update:', claims.length, 'claims');
        callback(claims);
      },
      (error) => {
        console.error('❌ Error in real-time subscription:', error);
        console.error('❌ Error code:', error.code);
        
        // If index error, try simpler query
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
          console.warn('⚠️ Trying fallback query without orderBy...');
          
          const simpleQuery = query(collection(db, CLAIMS_COLLECTION));
          
          const fallbackUnsubscribe = onSnapshot(
            simpleQuery,
            (snapshot) => {
              console.log('✅ Fallback query successful:', snapshot.size, 'claims');
              const claims = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
              }));
              
              // Sort manually
              claims.sort((a, b) => b.createdAt - a.createdAt);
              callback(claims);
            },
            (fallbackError) => {
              console.error('❌ Fallback also failed:', fallbackError);
              callback([]);
            }
          );
          
          return fallbackUnsubscribe;
        }
        
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up real-time subscription:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Provider Portal - Approve a claim
 * @param {String} claimId - Claim document ID
 * @returns {Promise<void>}
 */
export const approveClaim = async (claimId) => {
  try {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    await updateDoc(claimRef, {
      status: 'Approved',
      finalDecision: 'APPROVED',
      updatedAt: serverTimestamp()
    });
    console.log('✅ Claim approved:', claimId);
  } catch (error) {
    console.error('❌ Error approving claim:', error);
    throw error;
  }
};

/**
 * Provider Portal - Reject a claim
 * @param {String} claimId - Claim document ID
 * @param {String} reason - Optional rejection reason
 * @returns {Promise<void>}
 */
export const rejectClaim = async (claimId, reason = '') => {
  try {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    await updateDoc(claimRef, {
      status: 'Rejected',
      finalDecision: 'REJECTED',
      rejectionReason: reason,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Claim rejected:', claimId);
  } catch (error) {
    console.error('❌ Error rejecting claim:', error);
    throw error;
  }
};

/**
 * Provider Portal - Update claim status to Under Review
 * @param {String} claimId - Claim document ID
 * @returns {Promise<void>}
 */
export const markClaimUnderReview = async (claimId) => {
  try {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    await updateDoc(claimRef, {
      status: 'Under Review',
      updatedAt: serverTimestamp()
    });
    console.log('✅ Claim marked as Under Review:', claimId);
  } catch (error) {
    console.error('❌ Error updating claim status:', error);
    throw error;
  }
};

/**
 * ML Integration - Update claim with ML prediction results
 * @param {String} claimId - Claim document ID
 * @param {Object} mlResult - ML prediction results
 * @returns {Promise<void>}
 */
export const updateClaimWithMLResult = async (claimId, mlResult) => {
  try {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    await updateDoc(claimRef, {
      fraudProbability: mlResult.fraudProbability || null,
      riskLevel: mlResult.riskLevel || null,
      finalDecision: mlResult.finalDecision || null,
      status: mlResult.status || 'Under Review',
      mlAnalysisDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Claim updated with ML results:', claimId);
  } catch (error) {
    console.error('❌ Error updating claim with ML results:', error);
    throw error;
  }
};

/**
 * Hospital Portal - Get claims by hospital ID
 * @param {String} hospitalId - Hospital identifier
 * @returns {Promise<Array>}
 */
export const getClaimsByHospital = async (hospitalId) => {
  try {
    const q = query(
      collection(db, CLAIMS_COLLECTION),
      where('hospitalId', '==', hospitalId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const claims = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
    return claims;
  } catch (error) {
    console.error('❌ Error fetching hospital claims:', error);
    throw error;
  }
};

/**
 * Get real-time updates for a specific claim
 * @param {String} claimId - Claim document ID
 * @param {Function} callback - Function to call when claim updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToClaimUpdates = (claimId, callback) => {
  try {
    const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
    
    const unsubscribe = onSnapshot(
      claimRef,
      (doc) => {
        if (doc.exists()) {
          const claim = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          };
          callback(claim);
        }
      },
      (error) => {
        console.error('❌ Error subscribing to claim updates:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up claim subscription:', error);
    throw error;
  }
};

/**
 * Hospital Portal - Subscribe to real-time claims for a specific hospital
 * @param {String} hospitalId - Hospital identifier
 * @param {Function} callback - Function to call when claims update
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToHospitalClaims = (hospitalId, callback) => {
  try {
    console.log('🔍 Setting up hospital claims subscription for:', hospitalId);
    
    // Try query WITH orderBy first
    let q = query(
      collection(db, CLAIMS_COLLECTION),
      where('hospitalId', '==', hospitalId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('📦 Firestore snapshot received:', snapshot.size, 'documents');
        
        if (snapshot.empty) {
          console.log('⚠️ No documents found for hospitalId:', hospitalId);
          console.log('💡 This might mean:');
          console.log('   1. No claims have been submitted yet');
          console.log('   2. The hospitalId in submitted claims does not match:', hospitalId);
          console.log('   3. Firestore index is building (check console for index creation link)');
        }
        
        const claims = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('📄 Document data:', { id: doc.id, hospitalId: data.hospitalId, status: data.status, patient: data.patientName });
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        });
        
        console.log('🏥 Hospital claims update:', claims.length, 'claims for hospital', hospitalId);
        callback(claims);
      },
      (error) => {
        console.error('❌ Error in hospital claims subscription:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        
        // If error is about missing index, try without orderBy
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
          console.warn('⚠️ Missing Firestore index! Trying query without orderBy...');
          console.warn('📝 Create index at: https://console.firebase.google.com/project/claimgrid-d8c2e/firestore/indexes');
          
          // Fallback: Query without orderBy
          const simpleQuery = query(
            collection(db, CLAIMS_COLLECTION),
            where('hospitalId', '==', hospitalId)
          );
          
          const fallbackUnsubscribe = onSnapshot(
            simpleQuery,
            (snapshot) => {
              console.log('✅ Fallback query successful:', snapshot.size, 'documents');
              const claims = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
              }));
              
              // Sort manually in JavaScript
              claims.sort((a, b) => b.createdAt - a.createdAt);
              callback(claims);
            },
            (fallbackError) => {
              console.error('❌ Fallback query also failed:', fallbackError);
              callback([]);
            }
          );
          
          return fallbackUnsubscribe;
        }
        
        // For other errors, call callback with empty array
        console.log('⚠️ Calling callback with empty array due to error');
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up hospital claims subscription:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Alias for raiseClaim - Create a new claim
 * @param {Object} claimData - Claim information
 * @returns {Promise<string>} - Document ID of the created claim
 */
export const createClaim = raiseClaim;
