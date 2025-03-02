import React, { useState } from "react";
import axios from "../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../CSS/SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  axios
    .post("/shop/signup/", formData)  // Updated endpoint
    .then(() => {
      alert("Sign-up successful! Please log in to view the existing offers.");
      navigate("/login");
    })
    .catch((err) => {
      setError(err.response ? err.response.data.error || "An error occurred." : "An error occurred.");
    });
};

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-header">
          <span style={{ color: "#FF8080", fontWeight: "bold" }}> 🔆Register here!!</span>
        </h1>
        <p className="signup-subtitle">Get exclusive offers and discount </p>
        <form onSubmit={handleSubmit} className="signup-form">

          <input
              type="Username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
          />

          <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
          />
          <input
              type="password"
              name="password"
              placeholder="Password (6 or more characters)"
              value={formData.password}
              onChange={handleChange}
              required
          />

          <button type="submit" className="join-button">
            Submit
          </button>

        </form>
        <p className="signin-link">
          Already Registered? <a href="/login">Log in </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;