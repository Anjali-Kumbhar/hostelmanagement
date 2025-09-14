import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import './App.css';
import Navbar from './component/navbar';
import OtpVerification from './component/OtpVerification';
import Login from "./component/Login";
import StaffRegistration from './component/StaffRegistration';
import StudentRegistration from './component/StudentRegistration';
import RectorRegistration from "./component/RectorRegistration";
import StudentOtpVerification from "./component/StudentOtpVerification";
import RectorOtpVerification from "./component/RectorOtpVerification";
import StudentLogin from "./component/StudentLogin";
import RectorLogin from "./component/RectorLogin";

function App() {
  useEffect(() => {
    const fetchCsrfToken = async () => {
      const res = await axios.get("http://localhost:5001/csrf-token", {
        withCredentials: true,
      });
      axios.defaults.headers.post["X-CSRF-Token"] = res.data.csrfToken;
    };
    fetchCsrfToken();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/staffRegistration" element={<StaffRegistration />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/student-otp-verification" element={<StudentOtpVerification />} />
        <Route path="/rector-otp-verification" element={<RectorOtpVerification/>} />
        <Route path="/Login" element={<Login/>} />
        <Route path="/studentRegistration" element={<StudentRegistration />} />
        <Route path="/rectorRegistration" element={<RectorRegistration />} />
        <Route path="/studentLogin" element={<StudentLogin/>} />
        <Route path="/rectorLogin" element={<RectorLogin/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
