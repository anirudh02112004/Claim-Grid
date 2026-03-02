import { Link } from 'react-router-dom';

function PortalCard({ title, description, buttonText, icon, link, iconColor, buttonGradient, buttonHover }) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
      <div className={`flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 ${iconColor}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed text-base">{description}</p>
      <a
        href={link}
        className={`inline-block ${buttonGradient} text-white py-3 px-6 rounded-lg ${buttonHover} transition-all duration-300 font-semibold shadow-md hover:shadow-lg`}
      >
        {buttonText}
      </a>
    </div>
  );
}

export default PortalCard;
