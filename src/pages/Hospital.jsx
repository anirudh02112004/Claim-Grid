import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import KpiCard from '../components/KpiCard';
import ClaimsTable from '../components/ClaimsTable';
import { raiseClaim, subscribeToRealTimeClaims } from '../services/claimService';

function HospitalDashboard() {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showContactUsModal, setShowContactUsModal] = useState(false);
  const [showPatientRecordsModal, setShowPatientRecordsModal] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [patientNotFound, setPatientNotFound] = useState(false);
  const [searchUID, setSearchUID] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalClaims: 0,
    pendingApproval: 0,
    totalSettledAmount: 0,
    rejections: 0,
  });
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for new claim
  const [claimForm, setClaimForm] = useState({
    patientUid: '',
    diseaseName: '',
    attendingDoctor: '',
    diagnosisSummary: '',
    treatmentDetails: '',
    claimAmount: '',
    admissionDate: '',
    dischargeDate: '',
    clinicalNotes: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'hospital') {
      navigate('/login/hospital');
      return;
    }

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout - setting loading to false');
      setLoading(false);
    }, 5000); // 5 seconds timeout

    // 🔥 Subscribe to ALL real-time claims (transparency mode)
    console.log('🔥 Setting up Firebase subscription for ALL claims (transparency enabled)');
    console.log('👤 User data:', user);
    
    const unsubscribe = subscribeToRealTimeClaims((updatedClaims) => {
      clearTimeout(loadingTimeout); // Clear timeout when data arrives
      console.log('📥 Received ALL claims update:', updatedClaims.length, 'claims');
      console.log('📊 Claims data:', updatedClaims);
      
      // Map claims for display (Approved → Settled)
      const displayClaims = updatedClaims.map(claim => ({
        ...claim,
        displayStatus: claim.status === 'Approved' ? 'Settled' : claim.status,
        date: new Date(claim.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));
      
      console.log('✅ Display claims mapped:', displayClaims);
      setClaims(displayClaims);
      
      // Calculate stats from real-time data
      const totalClaims = updatedClaims.length;
      const pendingApproval = updatedClaims.filter(c => c.status === 'Pending').length;
      const settledClaims = updatedClaims.filter(c => c.status === 'Approved');
      const totalSettledAmount = settledClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
      const rejections = updatedClaims.filter(c => c.status === 'Rejected').length;
      
      console.log('📈 Dashboard stats:', { totalClaims, pendingApproval, totalSettledAmount, rejections });
      
      setDashboardStats({
        totalClaims,
        pendingApproval,
        totalSettledAmount,
        rejections
      });
      
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      console.log('🔥 Cleaning up hospital claims subscription');
      unsubscribe();
    };
  }, [navigate]);

  // Fetch patient data from CSV by UID
  const fetchPatientByUID = async (uid) => {
    if (!uid || uid.trim() === '') {
      setPatientData(null);
      setPatientNotFound(false);
      return;
    }

    try {
      const response = await fetch('/updated_insurance_dataset.csv');
      const csvText = await response.text();
      
      // Parse CSV
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      // Find patient with matching UID
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Handle quoted fields properly
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(v => v.replace(/^"|"$/g, '').trim());
        
        if (values[0] === uid.trim()) {
          // Found matching patient
          const patient = {
            uid: values[0],
            name: values[1],
            age: values[2],
            gender: values[3],
            phone: values[4],
            email: values[5],
            address: values[6],
            policyType: values[7],
            coverage: values[8],
            premium: values[9],
            authorizedDiseases: values[10]
          };
          setPatientData(patient);
          setPatientNotFound(false);
          return;
        }
      }
      
      // UID not found
      setPatientData(null);
      setPatientNotFound(true);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setPatientNotFound(true);
    }
  };

  const handleUIDBlur = () => {
    fetchPatientByUID(claimForm.patientUid);
  };

  const handleUIDKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPatientByUID(claimForm.patientUid);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClaimForm(prev => ({ ...prev, [name]: value }));
    
    // Reset patient data when UID changes
    if (name === 'patientUid') {
      setPatientData(null);
      setPatientNotFound(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!claimForm.patientUid.trim()) {
      alert('Please enter a Patient UID');
      return;
    }
    
    if (!claimForm.claimAmount || parseFloat(claimForm.claimAmount) <= 0) {
      alert('Please enter a valid claim amount');
      return;
    }

    if (!patientData) {
      alert('Please fetch patient data by entering a valid UID and pressing Enter');
      return;
    }
    
    console.log('Submitting claim:', claimForm);
    console.log('Patient data:', patientData);
    
    try {
      // 🔥 Firebase Integration - Raise claim to Firestore
      const user = JSON.parse(localStorage.getItem('user'));
      const hospitalId = user?.hospitalId || 'HOSP-001';
      const hospitalName = user?.hospitalName || 'General Hospital';

      console.log('🏥 Hospital submitting claim:', { hospitalId, hospitalName });

      const claimData = {
        patientName: patientData.name,
        policyId: claimForm.patientUid,
        hospitalId: hospitalId,
        hospitalName: hospitalName,
        amount: parseFloat(claimForm.claimAmount),
        diagnosis: claimForm.diseaseName || claimForm.diagnosisSummary || 'General Treatment',
        attendingDoctor: claimForm.attendingDoctor || 'Dr. Unknown',
        treatmentDetails: claimForm.treatmentDetails,
        admissionDate: claimForm.admissionDate,
        dischargeDate: claimForm.dischargeDate,
        clinicalNotes: claimForm.clinicalNotes,
        patientAge: patientData.age,
        patientGender: patientData.gender,
        policyType: patientData.policyType,
        coverage: patientData.coverage
      };

      console.log('📤 Claim data to be submitted:', claimData);

      const claimId = await raiseClaim(claimData);
      
      console.log('✅ Claim raised to Firebase with ID:', claimId);
      console.log('🔍 Verify this claim has hospitalId:', hospitalId);

      // Create new claim entry for local display
      const newClaim = {
        id: claimId,
        patientName: patientData.name,
        policyId: claimForm.patientUid,
        amount: parseFloat(claimForm.claimAmount),
        status: 'Pending',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // Add new claim to the beginning of claims array
      setClaims(prevClaims => [newClaim, ...prevClaims]);

      // Update dashboard stats
      setDashboardStats(prevStats => ({
        ...prevStats,
        totalClaims: prevStats.totalClaims + 1,
        pendingApproval: prevStats.pendingApproval + 1
      }));

      // Show success message
      alert(`✓ Claim submitted successfully to Firebase!\n\nClaim ID: ${claimId}\nPatient: ${newClaim.patientName}\nUID: ${claimForm.patientUid}\nAmount: ₹${newClaim.amount.toLocaleString()}\n\nStatus: Pending Approval\n\nThe provider can now see this claim in real-time!`);

      setShowClaimModal(false);
      
      // Reset form and patient data
      setClaimForm({
        patientUid: '',
        diseaseName: '',
        attendingDoctor: '',
        diagnosisSummary: '',
        treatmentDetails: '',
        claimAmount: '',
        admissionDate: '',
        dischargeDate: '',
      clinicalNotes: ''
    });
    setPatientData(null);
    setPatientNotFound(false);

    } catch (error) {
      console.error('❌ Error submitting claim to Firebase:', error);
      alert('Failed to submit claim. Please try again.\n\nError: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setShowClaimModal(false);
    setPatientData(null);
    setPatientNotFound(false);
    setClaimForm({
      patientUid: '',
      diseaseName: '',
      attendingDoctor: '',
      diagnosisSummary: '',
      treatmentDetails: '',
      claimAmount: '',
      admissionDate: '',
      dischargeDate: '',
      clinicalNotes: ''
    });
  };

  // Handle Patient Records Search
  const handlePatientRecordsSearch = async (e) => {
    e.preventDefault();
    
    if (!searchUID.trim()) {
      alert('Please enter a Patient UID');
      return;
    }

    setSearchLoading(true);
    setSearchNotFound(false);
    setSearchedPatient(null);

    try {
      const response = await fetch('/insurance_dataset_uid_based_dates.csv');
      const csvText = await response.text();
      
      // Parse CSV
      const lines = csvText.split('\n');
      
      // Find patient with matching UID
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Handle quoted fields properly
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim());
        
        if (values && values[0] === searchUID.trim()) {
          // Found matching patient
          const patient = {
            uid: values[0],
            name: values[1],
            age: values[2],
            gender: values[3],
            phone: values[4],
            email: values[5],
            address: values[6],
            policyType: values[7],
            coverage: values[8],
            premium: values[9],
            authorizedDiseases: values[10],
            dateOfInsuranceIssued: values[11]
          };
          
          setSearchedPatient(patient);
          setSearchLoading(false);
          return;
        }
      }
      
      // UID not found
      setSearchNotFound(true);
      setSearchLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error loading patient records. Please try again.');
      setSearchLoading(false);
    }
  };

  const handleClosePatientRecords = () => {
    setShowPatientRecordsModal(false);
    setSearchUID('');
    setSearchedPatient(null);
    setSearchNotFound(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        onNewClaimClick={() => setShowClaimModal(true)}
        onContactUsClick={() => setShowContactUsModal(true)}
        onPatientRecordsClick={() => setShowPatientRecordsModal(true)}
      />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-gray-100">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
              <p className="text-gray-600">Manage and track your insurance claims efficiently.</p>
            </div>
            <button 
              onClick={() => setShowClaimModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <span className="text-lg font-medium">+ Raise New Claim</span>
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <KpiCard title="Total Claims" value={dashboardStats.totalClaims} percentageChange={12} />
            <KpiCard title="Pending Approval" value={dashboardStats.pendingApproval} percentageChange={5} />
            <KpiCard title="Total Settled Amount" value={`₹${dashboardStats.totalSettledAmount.toLocaleString()}`} percentageChange={-2} />
            <KpiCard title="Rejections" value={dashboardStats.rejections} percentageChange={-8} />
          </div>

          <section className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Claims</h2>
              <div className="flex items-center gap-4">
                {!loading && claims.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live Updates</span>
                  </div>
                )}
                <button className="text-blue-600 hover:underline text-sm font-medium">View All</button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading claims...</p>
              </div>
            ) : (
              <ClaimsTable claims={claims} />
            )}
          </section>
        </main>

        {/* Footer with Contact Support */}
        <footer className="bg-white shadow-md p-6 text-center mt-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-700">HELP CENTER</h3>
            <p className="text-xs text-gray-500 mb-2">Having trouble with a claim?</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
              Contact Support
            </button>
          </div>
        </footer>
      </div>

      {/* Raise New Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Raise New Claim</h2>
                <p className="text-gray-500 text-sm mt-1">Enter UID and auto-fill patient details.</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="px-8 py-6 space-y-8">
              {/* Patient UID Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient UID
                </label>
                <input
                  type="text"
                  name="patientUid"
                  value={claimForm.patientUid}
                  onChange={handleInputChange}
                  onBlur={handleUIDBlur}
                  onKeyPress={handleUIDKeyPress}
                  placeholder="e.g. ACK210001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Patient details are auto-fetched when UID field loses focus or you press Enter.
                </p>

                {/* Patient Not Found Message */}
                {patientNotFound && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800">Patient Not Found</p>
                      <p className="text-xs text-red-600 mt-1">The UID you entered does not exist in our database. Please verify and try again.</p>
                    </div>
                  </div>
                )}

                {/* Patient Info Display */}
                {patientData && (
                  <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-4">
                      <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-lg font-bold text-green-900">Patient Found</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Name</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Age</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.age} years</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Gender</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Email</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Policy Type</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.policyType}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Address</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.address}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Coverage</p>
                        <p className="text-sm font-medium text-green-700">₹{parseInt(patientData.coverage).toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Authorized Diseases</p>
                        <p className="text-sm font-medium text-gray-900">{patientData.authorizedDiseases}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Disease & Medical Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Disease & Medical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="diseaseName"
                    value={claimForm.diseaseName}
                    onChange={handleInputChange}
                    placeholder="Disease Name"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="attendingDoctor"
                    value={claimForm.attendingDoctor}
                    onChange={handleInputChange}
                    placeholder="Attending Doctor Name"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  name="diagnosisSummary"
                  value={claimForm.diagnosisSummary}
                  onChange={handleInputChange}
                  placeholder="Diagnosis Summary"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                />
                <textarea
                  name="treatmentDetails"
                  value={claimForm.treatmentDetails}
                  onChange={handleInputChange}
                  placeholder="Treatment / Procedure Details"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Claim Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Claim Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    name="claimAmount"
                    value={claimForm.claimAmount}
                    onChange={handleInputChange}
                    placeholder="Claim Amount"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Admission Date</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={claimForm.admissionDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Discharge Date</label>
                  <input
                    type="date"
                    name="dischargeDate"
                    value={claimForm.dischargeDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  name="clinicalNotes"
                  value={claimForm.clinicalNotes}
                  onChange={handleInputChange}
                  placeholder="Clinical notes / claim notes (optional)"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactUsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Contact Us</h2>
                <button
                  onClick={() => setShowContactUsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-100 mt-2">We're here to help you with all your insurance claim needs</p>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Head Office */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">📍</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Head Office</h3>
                    <div className="text-gray-700 space-y-1">
                      <p className="font-semibold">ClaimGrid Technologies Pvt. Ltd.</p>
                      <p>Level 12, FinTech Tower</p>
                      <p>TIDEL Park, Rajiv Gandhi Salai</p>
                      <p>Chennai, Tamil Nadu – 600113</p>
                      <p>India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Numbers */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-sm border border-green-100">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">📞</div>
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Contact Numbers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Customer Support</p>
                        <p className="font-semibold text-gray-900">+91 90000 12345</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hospital Helpline</p>
                        <p className="font-semibold text-gray-900">+91 90000 23456</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Insurance Partner Desk</p>
                        <p className="font-semibold text-gray-900">+91 90000 34567</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Addresses */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">📧</div>
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Email Addresses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-600">General Enquiries</p>
                        <a href="mailto:support@claimgrid.in" className="font-semibold text-blue-600 hover:underline">
                          support@claimgrid.in
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hospital Support</p>
                        <a href="mailto:hospital@claimgrid.in" className="font-semibold text-blue-600 hover:underline">
                          hospital@claimgrid.in
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Insurance Relations</p>
                        <a href="mailto:insurer@claimgrid.in" className="font-semibold text-blue-600 hover:underline">
                          insurer@claimgrid.in
                        </a>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Technical Support</p>
                        <a href="mailto:tech@claimgrid.in" className="font-semibold text-blue-600 hover:underline">
                          tech@claimgrid.in
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Website & Social */}
              <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl shadow-sm border border-orange-100">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🌐</div>
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Website & Social</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a href="https://www.claimgrid.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                          www.claimgrid.in
                        </a>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <div>
                          <p className="text-sm text-gray-600">LinkedIn</p>
                          <a href="https://linkedin.com/company/claimgrid" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                            linkedin.com/company/claimgrid
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Twitter/X</p>
                          <a href="https://twitter.com/ClaimGrid" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                            @ClaimGrid
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-sm border border-yellow-100">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🕒</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Working Hours</h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between gap-8">
                        <span className="font-medium">Monday – Friday:</span>
                        <span>9:00 AM – 6:00 PM</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="font-medium">Saturday:</span>
                        <span>10:00 AM – 2:00 PM</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="font-medium">Sunday:</span>
                        <span className="text-red-600 font-semibold">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowContactUsModal(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Records Modal */}
      {showPatientRecordsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Patient Records Search
                </h2>
                <p className="text-blue-100 text-sm mt-1">Search for patient information by their unique ID</p>
              </div>
              <button
                onClick={handleClosePatientRecords}
                className="text-white hover:text-blue-200 text-2xl font-light"
              >
                ✕
              </button>
            </div>

            <div className="px-8 py-6">
              {/* Search Section */}
              <div className="mb-8">
                <form onSubmit={handlePatientRecordsSearch} className="space-y-4">
                  <div>
                    <label htmlFor="patient-search-uid" className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient UID
                    </label>
                    <div className="flex gap-4">
                      <input
                        id="patient-search-uid"
                        type="text"
                        value={searchUID}
                        onChange={(e) => setSearchUID(e.target.value)}
                        placeholder="Enter Patient UID (e.g., ACK210001)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={searchLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {searchLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    💡 Try sample UIDs: ACK210001, DIG220001, HDF230001, PMJ260001, ECH260001
                  </p>
                </form>
              </div>

              {/* Not Found Message */}
              {searchNotFound && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-6">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Patient Not Found</h3>
                  <p className="text-red-600">No patient record found with UID: <span className="font-mono font-semibold">{searchUID}</span></p>
                  <p className="text-sm text-red-500 mt-2">Please check the UID and try again</p>
                </div>
              )}

              {/* Patient Data Display */}
              {searchedPatient && (
                <div className="space-y-6">
                  {/* Patient Information Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white mb-1">{searchedPatient.name}</h3>
                      <p className="text-blue-100">Patient ID: <span className="font-mono font-semibold">{searchedPatient.uid}</span></p>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                          </h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Age</label>
                              <p className="text-gray-900">{searchedPatient.age} years</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Gender</label>
                              <p className="text-gray-900">{searchedPatient.gender}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Phone</label>
                              <p className="text-gray-900 font-mono">{searchedPatient.phone}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Email</label>
                              <p className="text-gray-900 text-sm break-all">{searchedPatient.email}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Address</label>
                              <p className="text-gray-900 text-sm">{searchedPatient.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Insurance Information */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Insurance Information
                          </h4>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Policy Type</label>
                              <p className="text-gray-900 font-semibold">{searchedPatient.policyType}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Coverage Amount</label>
                              <p className="text-green-600 text-xl font-bold">₹{parseInt(searchedPatient.coverage).toLocaleString()}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Premium</label>
                              <p className="text-gray-900">₹{parseInt(searchedPatient.premium).toLocaleString()}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-semibold text-gray-500">Insurance Issued Date</label>
                              <p className="text-gray-900">{new Date(searchedPatient.dateOfInsuranceIssued).toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authorized Diseases Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Authorized Diseases & Treatments
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {searchedPatient.authorizedDiseases.split(';').map((disease, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {disease.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;
