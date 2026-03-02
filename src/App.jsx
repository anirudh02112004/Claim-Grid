import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Hospital from './pages/Hospital';
import Patient from './pages/Patient';
import Login from './pages/Login';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Provider Dashboard - Full Page Layout (No Header/Footer) */}
        <Route path="/provider" element={<ProviderDashboard />} />
        
        {/* Regular Pages with Header/Footer */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/hospital" element={<Hospital />} />
                <Route path="/patient" element={<Patient />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
