
// export default OtpVerification;
import React, { useState } from "react";
import axios from "axios";
import { useLocation, Navigate } from "react-router-dom";

const RectorOtpVerification = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5001/rector-verify-otp", {
      email,
      otp: otp.trim(),
    });

    setMessage(res.data.message);
    setSuccess(true);
  } catch (err) {
    setMessage(err.response?.data?.message || "Verification failed!");
  }
};


  if (success) return <Navigate to="/login" />;

  return (
    <div className="form-container">
      <h2>Rector OTP Verification</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
    </div>
  );
};

export default RectorOtpVerification;
