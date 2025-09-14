import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

const StudentOtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Email passed from registration page
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If no email in state, go back to registration
  useEffect(() => {
    if (!email) {
      navigate("/studentRegistration");
    }
  }, [email, navigate]);

  // Fetch CSRF token on load
  useEffect(() => {
    axios
      .get("http://localhost:5001/csrf-token", { withCredentials: true })
      .then((res) => setCsrfToken(res.data.csrfToken))
      .catch((err) => {
        console.error("CSRF token fetch error:", err);
        setMessage("⚠️ Unable to fetch verification token. Try again later.");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/student-verify-otp",
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken && { "X-CSRF-Token": csrfToken }),
          },
          withCredentials: true,
        }
      );

      setMessage(res.data.message || "✅ OTP Verified!");
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Verification failed!");
    } finally {
      setLoading(false);
    }
  };

  if (success) return <Navigate to="/login" />;

  return (
    <div className="form-container">
      <h2>Student OTP Verification</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default StudentOtpVerification;
