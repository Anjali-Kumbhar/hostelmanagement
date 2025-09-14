// src/component/Navbar.js
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import "../styles/Navbar.css";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginDropdownOpen: false,
    };
  }

  toggleLoginDropdown = () => {
    this.setState((prev) => ({ loginDropdownOpen: !prev.loginDropdownOpen }));
  };

  handleLogout = () => {
    Cookies.remove("userType");
    Cookies.remove("userEmail");
    Cookies.remove("userName");
    window.location.reload();
  };

  renderNavLinks = () => {
    const userType = Cookies.get("userType");

    if (userType === "student") {
      return (
        <>
          <li><Link to="/complaint">Complaint</Link></li>
          <li><Link to="/nightoutform">Night Out Form</Link></li>
          <li><Link to="/leave-pass">Leave Pass</Link></li>
          <li><Link to="/room-change">Room Change</Link></li>
          <li><button onClick={this.handleLogout} className="logout-btn">Logout</button></li>
        </>
      );
    }

    if (userType === "staff") {
      return (
        <>
          <li><Link to="/complaint">Complaint</Link></li>
          <li><Link to="/nightout">Night Out</Link></li>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/student-details">Student Details</Link></li>
          <li><button onClick={this.handleLogout} className="logout-btn">Logout</button></li>
        </>
      );
    }

    if (userType === "rector") {
      return (
        <>
          <li><Link to="/room-allocate">Room Allocate</Link></li>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/complaints">Complaints</Link></li>
          <li><button onClick={this.handleLogout} className="logout-btn">Logout</button></li>
        </>
      );
    }

    // Not logged in
    return (
      <li className="login-dropdown">
        <button className="login-btn" onClick={this.toggleLoginDropdown}>
          Login ▾
        </button>
        {this.state.loginDropdownOpen && (
          <ul className="login-menu">
            <li><Link to="/Login">Login as Staff</Link></li>
            <li><Link to="/studentLogin">Login as Student</Link></li>
            <li><Link to="/rectorLogin">Login as Rector</Link></li>
          </ul>
        )}
      </li>
    );
  };

  render() {
    return (
      <nav className="custom-navbar">
        <div className="navbar-left">
          <Link to="/" className="brand-title">Hostel Management</Link>
        </div>
        <ul className="navbar-right">
          {this.renderNavLinks()}
        </ul>
      </nav>
    );
  }
}

export default Navbar;
