// src/component/StudentRegistration.jsx

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "../styles/StudentRegistration.css";

class StudentRegistration extends Component {
  state = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    year: "",
    branch: "",
    tgTeacher: "",
    phone: "",
    parentPhone: "",
    hostelName: "",
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
      year,
      branch,
      tgTeacher,
      phone,
      parentPhone,
      hostelName,
    } = this.state;

    if (!name || !email || !password || !confirmPassword || !year || !branch || !tgTeacher || !phone || !parentPhone || !hostelName) {
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
    if (!phoneRegex.test(phone) || !phoneRegex.test(parentPhone)) {
      return "❌ Phone numbers must be 10 digits.";
    }

    return null;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      email,
      password,
      year,
      branch,
      tgTeacher,
      phone,
      parentPhone,
      hostelName,
      csrfToken,
    } = this.state;

    const validationError = this.validateForm();
    if (validationError) {
      this.setState({ message: validationError });
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await axios.post(
        "http://localhost:5001/studentregister",
        {
          name,
          email,
          password,
          year,
          branch,
          tgTeacher,
          phone,
          parentPhone,
          hostelName,
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
      year,
      branch,
      tgTeacher,
      phone,
      parentPhone,
      hostelName,
      message,
      redirectToOtp,
      loading,
    } = this.state;

    if (redirectToOtp) {
      return <Navigate to="/student-otp-verification" state={{ email }} />;
    }

    return (
      <div className="form-container">
        <h2>Student Registration</h2>
        {message && <p className="message">{message}</p>}

        <form onSubmit={this.handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={name} onChange={this.handleChange} required />
          <input type="email" name="email" placeholder="Email" value={email} onChange={this.handleChange} required />
          <input type="password" name="password" placeholder="Password" value={password} onChange={this.handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={this.handleChange} required />
          <input type="text" name="year" placeholder="Year (e.g., FY, SY)" value={year} onChange={this.handleChange} required />
          <input type="text" name="branch" placeholder="Branch" value={branch} onChange={this.handleChange} required />
          <input type="text" name="tgTeacher" placeholder="TG Teacher Name" value={tgTeacher} onChange={this.handleChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" value={phone} onChange={this.handleChange} required />
          <input type="tel" name="parentPhone" placeholder="Parent's Phone Number" value={parentPhone} onChange={this.handleChange} required />
          <input type="text" name="hostelName" placeholder="Hostel Name" value={hostelName} onChange={this.handleChange} required />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    );
  }
}

export default StudentRegistration;
