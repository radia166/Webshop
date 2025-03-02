import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import apiClient from "../services/axiosConfig";
import "../CSS/loginpage.css";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
  e.preventDefault();

  apiClient
    .post("/api/token/", credentials)
    .then((response) => {
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // Decode the access token to get user details
      const decodedToken = jwt_decode(accessToken);
      const userId = decodedToken.user_id; // Extract user_id from the token

      // Store tokens and user_id in local storage
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user_id", userId);
      console.log("Stored user_id:", userId);  // Debugging

      alert("Login successful!");
      navigate("/");
    })
    .catch((error) => {
      console.error("Login failed:", error);
      alert("Invalid username or password.");
    });
};

  return (
    <div className="login-container">
      <div className="login-panel">
        <h2>🔆</h2>
        <h2>Welcome Back</h2>
        <p>Please enter your details to Log in.</p>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your username..."
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Enter your password..."
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <div className="login-options"></div>
          <button type="submit">Log in</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p>
          Don’t have an account yet? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
