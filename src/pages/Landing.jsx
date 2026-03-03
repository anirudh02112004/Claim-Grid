import Hero from '../components/Hero';
import PortalCard from '../components/PortalCard';
import Stats from '../components/Stats';
import Features from '../components/Features';
import { HospitalIcon, InsuranceIcon, PatientIcon } from '../components/Icons';

function Landing() {
  const portals = [
    {
      title: "Hospital",
      description: "Submit and track insurance claims seamlessly. Digital workflow for faster claim processing and real-time status updates.",
      buttonText: "Login as Hospital",
      icon: <HospitalIcon />,
      link: "/hospital",
      iconColor: "text-rose-500",
      buttonGradient: "bg-gradient-to-r from-rose-500 to-pink-600",
      buttonHover: "hover:from-rose-600 hover:to-pink-700"
    },
    {
      title: "Insurance Provider",
      description: "Review, approve, or flag claims with AI-powered risk assessment. Automated processing for low-risk claims.",
      buttonText: "Login as Provider",
      icon: <InsuranceIcon />,
      link: "/provider",
      iconColor: "text-teal-500",
      buttonGradient: "bg-gradient-to-r from-teal-500 to-cyan-600",
      buttonHover: "hover:from-teal-600 hover:to-cyan-700"
    },
    {
      title: "Patient",
      description: "Track your claim status and history in one place. Unified Insurance ID (INS-XXXX-XXXX) for all your policies.",
      buttonText: "Login as Patient",
      icon: <PatientIcon />,
      link: "/patient",
      iconColor: "text-purple-500",
      buttonGradient: "bg-gradient-to-r from-purple-500 to-indigo-600",
      buttonHover: "hover:from-purple-600 hover:to-indigo-700"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Stats Section - Trust Signals */}
      <div className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-extrabold mb-3 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">99.9%</div>
              <div className="text-xl font-semibold text-gray-300">Uptime Guarantee</div>
              <div className="text-sm text-gray-400 mt-2">Always available when you need us</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-extrabold mb-3 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">2 Hour</div>
              <div className="text-xl font-semibold text-gray-300">Claim Processing</div>
              <div className="text-sm text-gray-400 mt-2">Lightning-fast approvals</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">10k+</div>
              <div className="text-xl font-semibold text-gray-300">Daily Transactions</div>
              <div className="text-sm text-gray-400 mt-2">Processing millions monthly</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Cards Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Choose Your Portal</h2>
            <p className="text-xl text-gray-600">Access your personalized dashboard in seconds</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {portals.map((portal, index) => (
              <PortalCard
                key={index}
                title={portal.title}
                description={portal.description}
                buttonText={portal.buttonText}
                icon={portal.icon}
                link={`/login/${portal.title.toLowerCase()}`}
                iconColor={portal.iconColor}
                buttonGradient={portal.buttonGradient}
                buttonHover={portal.buttonHover}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center">
        <h2 className="text-4xl font-extrabold mb-6">Ready to simplify your claims process?</h2>
        <p className="text-xl mb-8 text-teal-50">Join thousands of healthcare providers already using ClaimGrid</p>
        <button className="bg-white text-teal-600 font-bold py-4 px-10 rounded-xl shadow-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 text-lg">
          Get Started Now →
        </button>
      </div>

      {/* Trust Section */}
      <div className="py-20 bg-white text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Trusted by 50+ hospitals and providers</h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join the growing network of healthcare providers and patients who trust ClaimGrid for their insurance claims.</p>
        <div className="mt-12 flex justify-center items-center gap-12 flex-wrap opacity-40 grayscale">
          <div className="text-4xl font-bold text-gray-800">AIIMS</div>
          <div className="text-4xl font-bold text-gray-800">Apollo</div>
          <div className="text-4xl font-bold text-gray-800">Fortis</div>
          <div className="text-4xl font-bold text-gray-800">Max</div>
          <div className="text-4xl font-bold text-gray-800">Medanta</div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
