// Feature Icons (inline SVG components)
const CheckShieldIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const BadgeCheckIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: <CheckShieldIcon />,
      title: "Unified Insurance ID",
      description: "One identity for all policies across different providers. Unique Insurance ID (INS-XXXX-XXXX) simplifies claim tracking."
    },
    {
      icon: <SparklesIcon />,
      title: "AI Risk Evaluation",
      description: "Intelligent automated checks to flag anomalies instantly. AI auto-approval engine for low-risk claims under configured threshold."
    },
    {
      icon: <LightningIcon />,
      title: "Faster Settlement",
      description: "Reduced claim cycles from weeks to minutes. Auto-approve claims under threshold with human review for flagged cases."
    },
    {
      icon: <EyeIcon />,
      title: "Transparent Workflow",
      description: "Full visibility for all stakeholders at every stage. Real-time updates and status tracking."
    },
    {
      icon: <ShieldCheckIcon />,
      title: "Fraud Risk Reduction",
      description: "Advanced verification against digital tampering. Multi-layer security with AI-powered fraud detection."
    },
    {
      icon: <BadgeCheckIcon />,
      title: "National Standards",
      description: "Compliant with health data exchange protocols. Follows industry best practices and regulations."
    }
  ];

  return (
    <div className="py-20 bg-white relative">
      {/* Subtle dotted background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #0f4bd8 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Why ClaimGrid Box - Left side */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 h-full shadow-lg">
              <h3 className="text-2xl font-bold mb-6">Why ClaimGrid?</h3>
              <div className="space-y-4 text-blue-50">
                <p className="text-sm leading-relaxed">
                  Built on modern architecture principles to eliminate fragmentation in insurance claim processing.
                </p>
                <p className="text-sm leading-relaxed">
                  Real-time interoperability between hospitals, insurers, and patients.
                </p>
                <p className="text-sm leading-relaxed">
                  AI-powered automation reduces processing time while maintaining compliance and security.
                </p>
                <p className="text-sm leading-relaxed">
                  Scalable infrastructure handles millions of claims with 99.9% uptime.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid - Right side (3 columns, 2 rows) */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center lg:text-left">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
