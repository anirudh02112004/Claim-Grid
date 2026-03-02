import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/claimgrid-logo.jpeg';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <img src={logo} alt="ClaimGrid Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-900">ClaimGrid</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Home
            </Link>
            <Link 
              to="/login/hospital" 
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Hospital
            </Link>
            <Link 
              to="/login/provider" 
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Provider
            </Link>
            <Link 
              to="/login/patient" 
              className="text-gray-600 hover:text-teal-600 transition font-medium"
            >
              Patient
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
