// // import React, { useState } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import "../styles/OtpVerification.css";

// // const OtpVerification = () => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const email = location.state?.email;

// //   const [otp, setOtp] = useState("");
// //   const [message, setMessage] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const handleChange = (e) => {
// //     setOtp(e.target.value);
// //     setMessage("");
// //   };

// //   const handleVerifyOtp = async (e) => {
// //     e.preventDefault();

// //     if (!email) {
// //       setMessage("❌ Email is missing. Please register again.");
// //       return;
// //     }

// //     if (otp.length !== 6) {
// //       setMessage("❌ OTP must be 6 digits.");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       const response = await axios.post(
// //         "http://localhost:5001/verify-otp",
// //         { email, otp },
// //         { withCredentials: true }
// //       );

// //       if (response.status === 200) {
// //         setMessage("✅ OTP Verified! Registration Successful.");
// //         setTimeout(() => navigate("/login"), 2000);
// //       } else {
// //         setMessage("❌ Invalid OTP. Please try again.");
// //       }
// //     } catch (error) {
// //       console.error("OTP Verification Error:", error);
// //       setMessage(
// //         error?.response?.data?.message || "⚠️ Verification failed! Please try again."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="otp-wrapper">
// //       <div className="otp-container">
// //         <h2>OTP Verification</h2>

// //         {message && <p className="message">{message}</p>}

// //         <form onSubmit={handleVerifyOtp} className="otp-form">
// //           <input
// //             type="text"
// //             name="otp"
// //             placeholder="Enter 6-digit OTP"
// //             value={otp}
// //             onChange={handleChange}
// //             maxLength="6"
// //             required
// //             pattern="\d{6}"
// //             title="Enter a valid 6-digit OTP"
// //           />
// //           <button type="submit" disabled={loading}>
// //             {loading ? "Verifying..." : "Verify OTP"}
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default OtpVerification;
// import React, { useState } from "react";
// import axios from "axios";
// import { useLocation, Navigate } from "react-router-dom";

// const OtpVerification = () => {
//   const location = useLocation();
//   const email = location.state?.email;
//   const [otp, setOtp] = useState("");
//   const [message, setMessage] = useState("");
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post("http://localhost:5001/staff-verify-otp", {
//         email,
//         otp,
//       });

//       setMessage(res.data.message);
//       setSuccess(true);
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Verification failed!");
//     }
//   };

//   if (success) return <Navigate to="/login" />;

//   return (
//     <div className="form-container">
//       <h2>OTP Verification</h2>
//       {message && <p className="message">{message}</p>}
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Enter OTP"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           required
//         />
//         <button type="submit">Verify OTP</button>
//       </form>
//     </div>
//   );
// };

// export default OtpVerification;


import React, { useState } from "react";
import axios from "axios";
import { useLocation, Navigate } from "react-router-dom";

const OtpVerification = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("❌ Email not provided. Please register again.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/staff-verify-otp", {
        email,
        otp,
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
      <h2>OTP Verification</h2>
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

export default OtpVerification;
