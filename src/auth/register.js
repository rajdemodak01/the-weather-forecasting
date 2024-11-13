import { useState } from "react";
import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toggleRegister } from "../store/store";

export default function Register() {
  const dispatch=useDispatch()
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PORT}/auth/sendOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const responseData = await response.json();  
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
        dispatch(toggleRegister())
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };
  return (
    <div>
      <div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isEmailVerified}
        />
        <button
          onClick={handleVerifyEmail}
          disabled={isOtpSent || isEmailVerified}
        >
          Verify Email
        </button>
      </div>
      {isOtpSent && !isEmailVerified && (
        <div>
          <input
            type="text"
            placeholder="Enter otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp}>Verify Otp</button>
          {otpError && <p style={{ color: "red" }}>{otpError}</p>}
        </div>
      )}
      <div>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={!isEmailVerified}
        />
        <input
          type="text"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={!isEmailVerified}
        />
        <button onClick={handleRegister} disabled={!isEmailVerified}>
          Register
        </button>
      </div>
    </div>
  );
};
