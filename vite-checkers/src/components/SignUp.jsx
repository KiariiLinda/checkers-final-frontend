import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignUp.css";
import { signUp } from "../services/api.js";
import Checkersboard from "../assets/Checker-Boarders.png";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Signing up...");
    setError("");
    setLoading(true); // Set loading to true
    try {
      const response = await signUp({ username, email, password });
      console.log("Sign up response:", response);
      setMessage("Sign up successful! Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.message === "User already exists") {
        setError(`A user with the email ${email} already exists. Please try a different one.`);
      } else {
        setError(error.message || "An error occurred during sign up. Please try again.");
      }
      setMessage("");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="sign-up-content-wrapper" style={{ backgroundImage: `url(${Checkersboard})` }}>
      <div className="signup-container">
        <h2 className="signup-title">Create your account here</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="signup-form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="signup-form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="signup-form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="signup-button-container">
            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </div>
        </form>
        {message && <p className="signup-message success" aria-live="polite">{message}</p>}
        {error && <p className="signup-message error" aria-live="assertive">{error}</p>}
        <p className="signup-signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
