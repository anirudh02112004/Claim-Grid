function Stats() {
  const stats = [
    { value: "10M+", label: "Claims Processed" },
    { value: "500+", label: "Hospitals Connected" },
    { value: "99.9%", label: "Uptime Reliability" },
    { value: "150+", label: "Insurance Partners" }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted text */}
        <p className="text-center text-gray-500 text-sm uppercase tracking-wider mb-12">
          Trusted by Healthcare & Insurance Leaders Nationwide
        </p>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stats;
