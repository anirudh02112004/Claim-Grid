import logo from '../assets/claimgrid-logo.jpeg';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="ClaimGrid" className="h-8 w-8" />
            <span className="text-white font-bold text-lg">ClaimGrid</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#" className="hover:text-teal-400 transition">
              Privacy Policy
            </a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-teal-400 transition">
              Terms of Use
            </a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-teal-400 transition">
              Support
            </a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-teal-400 transition">
              API Documentation
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 text-xs text-gray-500">
          © 2026 ClaimGrid. All rights reserved. | Powering the future of insurance claims.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
