import { useState, useEffect } from 'react';

function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = ['/hero-bg-1.jpg', '/hero-bg-2.jpg', '/hero-bg-3.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative text-white min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Transition */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500"
          style={{
            backgroundImage: `url(${image})`,
            opacity: currentImageIndex === index ? 0.7 : 0,
          }}
        />
      ))}
      
      {/* Strong Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-lg">
          ClaimGrid – UPI for Insurance Claims
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-100 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-md">
          A unified digital infrastructure connecting Hospitals, Insurance Providers, 
          and Patients on a single claim processing platform.
        </p>
      </div>
    </div>
  );
}

export default Hero;
