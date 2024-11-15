import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; 
import { setLoginStatus } from "../store/store.js"; 

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_PORT}/auth/sendOtp`, { email });
      if (response.status === 200) {
        setIsOtpSent(true);
        alert("OTP sent successfully");
      } else {
        alert("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP", error);
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_PORT}/auth/verifyOtp`, { email, otp });
      if (response.status === 200) {
        setIsOtpVerified(true);
        alert("OTP verified successfully");
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP", error);
      setError("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // console.log("login called");
    try {
      const response = await axios.post(`${process.env.REACT_APP_PORT}/auth/login`, {
        email,
        password,
      });
      if (response.status === 200) {
        // console.log(response.data)
        const { accessToken } = response.data; 
        localStorage.setItem("accessToken", accessToken);
        alert("Login successful");
        dispatch(setLoginStatus(true)); 
        navigate("/home"); 
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed", error);
      setError("Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-teal-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
  
        <form onSubmit={isOtpVerified ? handlePasswordSubmit : isOtpSent ? handleOtpSubmit : handleEmailSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isOtpSent}
              placeholder="Enter your email"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
  
          {isOtpSent && (
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isOtpVerified}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
  
          {isOtpVerified && (
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
  
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? "Processing..." : isOtpVerified ? "Login" : isOtpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </form>
  
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:text-blue-800"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default Login;