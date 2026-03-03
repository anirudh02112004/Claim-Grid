import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Hospital from "./pages/Hospital";
import Login from "./pages/Login";
import ProviderDashboard from "./pages/ProviderDashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* ✅ Provider Dashboard (No Header/Footer) */}
        <Route path="/provider/*" element={<ProviderDashboard />} />

        {/* ✅ Hospital Dashboard (No Header/Footer) */}
        <Route path="/hospital" element={<Hospital />} />

        {/* ✅ Regular Pages with Header/Footer Layout */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login/:role" element={<Login />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;