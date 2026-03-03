import { Link } from 'react-router-dom';
import { useState } from 'react';

function Patient() {
  const [searchUID, setSearchUID] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchUID.trim()) {
      alert('Please enter a Patient UID');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setPatientData(null);

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
          
          setPatientData(patient);
          setLoading(false);
          return;
        }
      }
      
      // UID not found
      setNotFound(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error loading patient records. Please try again.');
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchUID('');
    setPatientData(null);
    setNotFound(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-3xl font-bold text-white">Patient Records</h1>
          </div>
          <p className="text-blue-100">Search for your complete medical insurance information by entering your unique patient ID</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Search Your Records</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search-uid" className="block text-sm font-semibold text-gray-700 mb-2">
                Patient UID
              </label>
              <div className="flex gap-4">
                <input
                  id="search-uid"
                  type="text"
                  value={searchUID}
                  onChange={(e) => setSearchUID(e.target.value)}
                  placeholder="Enter Patient UID (e.g., ACK210001)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
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
                {(patientData || notFound) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              💡 Try sample UIDs: ACK210001, DIG220001, HDF230001, PMJ260001, ECH260001
            </p>
          </form>
        </div>

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-red-800 mb-2">Patient Not Found</h3>
            <p className="text-red-600">No patient record found with UID: <span className="font-mono font-semibold">{searchUID}</span></p>
            <p className="text-sm text-red-500 mt-2">Please check the UID and try again</p>
          </div>
        )}

        {/* Patient Data Display */}
        {patientData && (
          <div className="space-y-6">
            {/* Patient Information Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">{patientData.name}</h2>
                <p className="text-blue-100">Patient ID: <span className="font-mono font-semibold">{patientData.uid}</span></p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-blue-600">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                        <p className="text-gray-900 text-lg font-medium mt-1">{patientData.name}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Age</label>
                        <p className="text-gray-900 text-lg font-medium mt-1">{patientData.age} years</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                        <p className="text-gray-900 text-lg font-medium mt-1">{patientData.gender}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                        <p className="text-gray-900 text-lg font-mono mt-1">{patientData.phone}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                        <p className="text-gray-900 break-all mt-1">{patientData.email}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Address</label>
                        <p className="text-gray-900 mt-1">{patientData.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-green-600">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Insurance Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Policy Type</label>
                        <p className="text-gray-900 text-lg font-bold mt-1">{patientData.policyType}</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Coverage Amount</label>
                        <p className="text-green-600 text-2xl font-bold mt-1">₹{parseInt(patientData.coverage).toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Annual Premium</label>
                        <p className="text-gray-900 text-lg font-medium mt-1">₹{parseInt(patientData.premium).toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Insurance Issued Date</label>
                        <p className="text-gray-900 font-medium mt-1">{new Date(patientData.dateOfInsuranceIssued).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <label className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Policy Status</label>
                        </div>
                        <p className="text-blue-900 font-bold text-lg">Active & Valid</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorized Diseases Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-purple-600">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Authorized Diseases & Treatments
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">The following medical conditions and treatments are covered under your insurance policy:</p>
              
              <div className="flex flex-wrap gap-3">
                {patientData.authorizedDiseases.split(';').map((disease, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold border border-purple-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {disease.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Record
              </button>
              
              <button className="bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              
              <button className="bg-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Patient;
