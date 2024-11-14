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
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={isOtpVerified ? handlePasswordSubmit : isOtpSent ? handleOtpSubmit : handleEmailSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isOtpSent} // Disable email field if OTP is sent
          />
        </div>

        {isOtpSent && (
          <div>
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={isOtpVerified} // Disable OTP field if verified
            />
          </div>
        )}

        {isOtpVerified && (
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : isOtpVerified ? "Login" : isOtpSent ? "Verify OTP" : "Send OTP"}
        </button>
      </form>

      <div>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
    </div>
  );
}

export default Login;