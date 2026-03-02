import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8000/auth/google", {
        token: credentialResponse.credential,
        role: role
      });

      const userData = res.data.user;
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect based on role
      if (userData.role === "hospital") {
        navigate("/hospital");
      } else if (userData.role === "provider") {
        navigate("/provider");
      } else if (userData.role === "patient") {
        navigate("/patient");
      }
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    
    const loggedInUser = {
      id: "user-" + role + "-" + Date.now(),
      name: email,
      email: email,
      role: role,
      isGuest: false,
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));

    if (role === "hospital") {
      navigate("/hospital");
    } else if (role === "patient") {
      navigate("/patient");
    } else if (role === "provider") {
      navigate("/provider");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">{role.charAt(0).toUpperCase() + role.slice(1)} Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              const guestUser = {
                id: "guest-" + role + "-" + Date.now(),
                name:
                  role === "hospital"
                    ? "City General Hospital (Guest)"
                    : role === "patient"
                    ? "John Doe (Guest)"
                    : "Insurance Admin (Guest)",
                role: role,
                isGuest: true,
              };

              localStorage.setItem("user", JSON.stringify(guestUser));

              if (role === "hospital") {
                navigate("/hospital");
              } else if (role === "patient") {
                navigate("/patient");
              } else if (role === "provider") {
                navigate("/provider");
              }
            }}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
          >
            Continue as Guest
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Login Failed');
                alert('Google Login Failed. Please try again.');
              }}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;