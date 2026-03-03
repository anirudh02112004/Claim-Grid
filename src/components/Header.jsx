import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/claimgrid-logo.jpeg';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white/10 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className={`flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 ${
              scrolled ? '' : 'drop-shadow-lg'
            }`}
          >
            <img src={logo} alt="ClaimGrid Logo" className="h-10 w-auto rounded-md" />
            <span className="text-xl font-bold text-gray-900">
              ClaimGrid
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`relative px-4 py-2 font-medium uppercase tracking-wide text-sm transition-all duration-300 rounded-lg text-gray-900 hover:text-teal-600 hover:bg-teal-50 ${
                isActive('/') ? '!text-teal-600 !bg-teal-50' : ''
              }`}
            >
              Home
              {isActive('/') && (
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  scrolled ? 'bg-teal-600' : 'bg-white'
                }`} />
              )}
            </Link>
            <Link 
              to="/login/hospital" 
              className={`relative px-4 py-2 font-medium uppercase tracking-wide text-sm transition-all duration-300 rounded-lg text-gray-900 hover:text-teal-600 hover:bg-teal-50 ${
                isActive('/login/hospital') ? '!text-teal-600 !bg-teal-50' : ''
              }`}
            >
              Hospital
              {isActive('/login/hospital') && (
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  scrolled ? 'bg-teal-600' : 'bg-white'
                }`} />
              )}
            </Link>
            <Link 
              to="/login/provider" 
              className={`relative px-4 py-2 font-medium uppercase tracking-wide text-sm transition-all duration-300 rounded-lg text-gray-900 hover:text-teal-600 hover:bg-teal-50 ${
                isActive('/login/provider') ? '!text-teal-600 !bg-teal-50' : ''
              }`}
            >
              Provider
              {isActive('/login/provider') && (
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  scrolled ? 'bg-teal-600' : 'bg-white'
                }`} />
              )}
            </Link>
            
            {/* CTA Button */}
            <Link 
              to="/login/patient" 
              className={`ml-2 px-6 py-2 font-semibold uppercase tracking-wide text-sm transition-all duration-300 rounded-lg ${
                scrolled 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-md hover:shadow-lg' 
                  : 'bg-white/20 backdrop-blur-md text-gray-900 border-2 border-white/30 hover:bg-white/30 hover:border-white/50'
              } transform hover:scale-105`}
            >
              Patient Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
