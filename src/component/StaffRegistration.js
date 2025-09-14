// src/component/StaffRegistration.jsx

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "../styles/StaffRegistration.css";

class StaffRegistration extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    staffId: "",
    staffType: "staff",
    deptName: "",
    tgYear: "",
    tgBatch: "",
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
    const {
      name,
      email,
      password,
      confirmPassword,
      staffId,
      staffType,
      deptName,
      tgYear,
      tgBatch,
      phone,
    } = this.state;

    // Basic validation
    if (!name || !email || !password || !confirmPassword || !staffId || !staffType || !deptName || !phone) {
      return "❌ Please fill in all required fields.";
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "❌ Invalid email format.";
    }

    // Password match
    if (password !== confirmPassword) {
      return "❌ Passwords do not match.";
    }

    // Password length
    if (password.length < 6) {
      return "❌ Password must be at least 6 characters.";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return "❌ Phone number must be 10 digits.";
    }

    // TG fields if applicable
    if (staffType === "tg" && (!tgYear || !tgBatch)) {
      return "❌ TG Year and Batch are required for TG staff.";
    }

    return null;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      email,
      password,
      staffId,
      staffType,
      deptName,
      tgYear,
      tgBatch,
      phone,
      csrfToken,
    } = this.state;

    // Validate inputs
    const validationError = this.validateForm();
    if (validationError) {
      this.setState({ message: validationError });
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await axios.post(
        "http://localhost:5001/staffregister",
        {
          name,
          email,
          password,
          staffId,
          staffType,
          deptName,
          tgYear: staffType === "tg" ? tgYear : "",
          tgBatch: staffType === "tg" ? tgBatch : "",
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
      staffId,
      staffType,
      deptName,
      tgYear,
      tgBatch,
      phone,
      message,
      redirectToOtp,
      loading,
    } = this.state;

    const tgYearOptions = ["FY", "SY", "TY", "BE"];
    const tgBatchOptions = [
      "F1", "F2", "F3",
      "S1", "S2", "S3",
      "T1", "T2", "T3",
      "B1", "B2", "B3",
    ];

    if (redirectToOtp) {
      return <Navigate to="/otp-verification" state={{ email }} />;
    }

    return (
      <div className="form-container">
        <h2>Staff Registration</h2>

        {message && <p className="message">{message}</p>}

        <form onSubmit={this.handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={name} onChange={this.handleChange} required />
          <input type="email" name="email" placeholder="Email" value={email} onChange={this.handleChange} required />
          <input type="password" name="password" placeholder="Password" value={password} onChange={this.handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={this.handleChange} required />
          <input type="text" name="staffId" placeholder="Staff ID" value={staffId} onChange={this.handleChange} required />
          
          <select name="staffType" value={staffType} onChange={this.handleChange} required>
            <option value="staff">Staff</option>
            <option value="cc">CC</option>
            <option value="tg">TG</option>
          </select>

          <input type="text" name="deptName" placeholder="Department Name" value={deptName} onChange={this.handleChange} required />

          {staffType === "tg" && (
            <>
              <select name="tgYear" value={tgYear} onChange={this.handleChange} required>
                <option value="">Select TG Year</option>
                {tgYearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select name="tgBatch" value={tgBatch} onChange={this.handleChange} required>
                <option value="">Select TG Batch</option>
                {tgBatchOptions.map((batch) => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </>
          )}

          <input type="tel" name="phone" placeholder="Phone Number" value={phone} onChange={this.handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    );
  }
}

export default StaffRegistration;
