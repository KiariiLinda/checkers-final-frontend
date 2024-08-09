import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignIn.css";
import { signIn } from "../services/api.js";
import { setAuthToken } from "../services/api";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Signing in...");
    setError("");
    setLoading(true); // Start loading
    try {
      const response = await signIn({ email, password });
      console.log("Sign in response:", response);
      setMessage("Sign in successful! Redirecting...");
      localStorage.setItem("token", response.token);
      setAuthToken(response.token);
      setTimeout(() => navigate("/game"), 2000);
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        error.message || "An error occurred during sign in. Please try again."
      );
      setMessage("");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="body1">
      <div className="signin-container">
        <h2 className="signin-title">Sign In</h2>
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="signin-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="signin-form-group">
            <label htmlFor="password">Password:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-button"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? <div className="spinner"></div> : "Sign In"}
          </button>
        </form>
        {message && <p className="signin-message success">{message}</p>}
        {error && <p className="signin-message error">{error}</p>}
        <p className="signin-signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
