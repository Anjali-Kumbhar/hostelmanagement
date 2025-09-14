// src/component/StaffRegistration.jsx

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "../styles/RectorRegistration.css";

class RectorRegistration extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    csrfToken: "",
    message: "",
    redirectToOtp: false,
    loading: false,
  };

  componentDidMount() {
    axios
      .get("http://localhost:5001/csrf-token", { withCredentials: true })
      .then((res) => this.setState({ csrfToken: res.data?.csrfToken }))
      .catch(() =>
        this.setState({ message: "❌ Failed to fetch CSRF token." })
      );
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value, message: "" });
  };

  validateForm = () => {
    const { name, email, password, confirmPassword, phone } = this.state;

    if (!name || !email || !password || !confirmPassword || !phone) {
      return "❌ Please fill in all required fields.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "❌ Invalid email format.";
    }

    if (password !== confirmPassword) {
      return "❌ Passwords do not match.";
    }

    if (password.length < 6) {
      return "❌ Password must be at least 6 characters.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return "❌ Phone number must be 10 digits.";
    }

    return null;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, csrfToken } = this.state;

    const validationError = this.validateForm();
    if (validationError) {
      this.setState({ message: validationError });
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await axios.post(
        "http://localhost:5001/rectorregister",
        {
          name,
          email,
          password,
          phone,
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
        }
      );

      this.setState({
        message: res.data.message || "✅ Registration successful!",
        redirectToOtp: true,
        loading: false,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "❌ Registration failed! Try again.";
      this.setState({ message: errorMsg, loading: false });
    }
  };

  render() {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      message,
      redirectToOtp,
      loading,
    } = this.state;

    if (redirectToOtp) {
      return <Navigate to="/rector-otp-verification" state={{ email }} />;
    }

    return (
      <div className="form-container">
        <h2>Rector Registration</h2>

        {message && <p className="message">{message}</p>}

        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={this.handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={this.handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={this.handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={this.handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={phone}
            onChange={this.handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    );
  }
}

export default RectorRegistration;
