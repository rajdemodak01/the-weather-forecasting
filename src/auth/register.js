import { useState } from "react";
import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoginStatus } from "../store/store.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    try {
      if(!email){
        alert("Enter the complete mail id")
        return
      }
      const response = await fetch(`${process.env.REACT_APP_PORT}/auth/sendOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        await response.json();  
        alert("OTP sent successfully");
        setIsOtpSent(true);
      } else {
        const errorText = await response.text(); 
        console.error("Error sending OTP", errorText);
        alert(errorText || "Failed to send OTP");
      }         
    } catch (error) {
      console.log("Error sending otp", error);
      alert(error.response?.data?.message || "Failed to send otp");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_PORT}/auth/verifyOtp`, { email, otp });
      if (response.status === 200) {
        setIsEmailVerified(true);
        alert("Email is verified successfully");
      }
    } catch (error) {
      setOtpError("Invalid or expired OTP");
      console.error("Error verifying otp", error);
    }
  };

  const handleRegister = async (e) => {
    try {
      e.preventDefault();
      //     If the event is tied to a form submission (like when a user clicks the "Register" button), the default behavior is that the form is submitted and the page is reloaded (a full-page refresh).
      // In this case, e.preventDefault() stops the form from being submitted and the page from reloading, so that we can handle the form submission asynchronously using JavaScript (via axios or fetch).
      const response = await axios.post(`${process.env.REACT_APP_PORT}/auth/register`, {
        email,
        username,
        password,
      });
      if (response.status === 200) {
        alert("registration successful");
        const loginResponse = await axios.post(`${process.env.REACT_APP_PORT}/auth/login`, {
          email,
          password,
        });
        if (loginResponse.status === 200) {
          // console.log(response.data)
          const { accessToken } = loginResponse.data; 
          localStorage.setItem("accessToken", accessToken);
          alert("Login successful");
          dispatch(setLoginStatus(true)); 
          navigate("/home"); 
        } else {
          alert("Invalid credentials");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-teal-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
  
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEmailVerified}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleVerifyEmail}
            disabled={isOtpSent || isEmailVerified}
            className="mt-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Verify Email
          </button>
        </div>
  
        {isOtpSent && !isEmailVerified && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleVerifyOtp}
              className="mt-2 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Verify OTP
            </button>
            {otpError && <p className="text-red-500 mt-2">{otpError}</p>}
          </div>
        )}
  
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={!isEmailVerified}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!isEmailVerified}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-4"
          />
          <button
            onClick={handleRegister}
            disabled={!isEmailVerified}
            className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Register
          </button>
        </div>
  
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-800"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
  
};
