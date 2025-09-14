import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5001/csrf-token", { withCredentials: true })
      .then((res) => setCsrfToken(res.data.csrfToken))
      .catch((err) => console.error("CSRF token fetch error:", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5001/staff-login",
        { email: email.trim(), password },
        {
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken && { "X-CSRF-Token": csrfToken }),
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const { email, name } = response.data;
        Cookies.set("userEmail", email, { expires: 7 });
        Cookies.set("userName", name, { expires: 7 });
        Cookies.set("userType", "staff", { expires: 7 });

        alert("Login successful!");
        navigate("/home");
        window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        setError("❌ Invalid credentials.");
      } else {
        setError("⚠️ Server error. Try again later.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2>Staff Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        <div className="signup-links">
          <p>Not registered? <a href="/staffRegistration">Register Here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
