require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const csrf = require("csurf");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Models
const StaffRegistration  = require("./models/StaffRegistration");
const TempUser = require("./models/TempUser");
const OtpVerification = require("./models/OtpVerification");

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/shree")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ✅ Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Optional: serve uploads

// ✅ Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || "yoursecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 30, // 30 mins
  },
}));

// ✅ CSRF Setup (Skip only API calls that do not modify session/cookies)
const csrfProtection = csrf({ cookie: true });
const csrfSkips = ["/register", "/verify-otp", "/login"];
app.use((req, res, next) => {
  if (csrfSkips.includes(req.path)) return next();
  return csrfProtection(req, res, next);
});

// ✅ CSRF Token
app.get("/csrf-token", csrfProtection, (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), { httpOnly: false });
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Staff Registration API
app.post("/staffregister", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      staffId,
      staffType,
      deptName,
      tgYear,
      tgBatch,
      phone
    } = req.body;

    if (!name || !email || !password || !staffId || !staffType || !deptName || !phone) {
      return res.status(400).json({ message: "All required fields must be filled!" });
    }

    // ✅ TG-specific required fields
    if (staffType === "tg" && (!tgYear || !tgBatch)) {
      return res.status(400).json({ message: "TG year and batch are required for TG." });
    }

    // ✅ Duplicate check
    const existingUser = await TempUser.findOne({ $or: [{ email }, { staffId }] }) ||
                         await StaffRegistration.findOne({ $or: [{ email }, { staffId }] });

    if (existingUser) {
      return res.status(400).json({ message: "Email or Staff ID already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save to TempUser
    await TempUser.create({
      name,
      email,
      password: hashedPassword,
      staffId,
      staffType,
      deptName,
      tgYear: staffType === "tg" ? tgYear : undefined,
      tgBatch: staffType === "tg" ? tgBatch : undefined,
      phone,
    });

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    await OtpVerification.create({ email, otp });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      email,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ OTP Verification
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Get latest OTP for this email
    const latestOtp = await OtpVerification.findOne({ email }).sort({ createdAt: -1 });
    if (!latestOtp) {
      return res.status(404).json({ message: "OTP not found. Please request again." });
    }

    if (latestOtp.otp !== otp) {
      return res.status(400).json({ message: "❌ Incorrect OTP" });
    }

    // Find user in TempUser
    const user = await TempUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found in temp storage." });
    }

    // Move to final StaffRegistration collection
    await StaffRegistration.create({
      name: user.name,
      email: user.email,
      password: user.password,
      staffId: user.staffId,
      staffType: user.staffType,
      deptName: user.deptName,
      tgYear: user.tgYear,
      tgBatch: user.tgBatch,
      phone: user.phone,
    });

    // Cleanup
    await TempUser.deleteOne({ email });
    await OtpVerification.deleteMany({ email });

    res.status(200).json({ message: "✅ OTP verified and registration completed!" });

  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// ✅ Unified Login Route
app.post("/login", async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    let model;
    if (userType === "Staff") {
      model = require("./models/StaffRegistration");
    } else if (userType === "Student") {
      model = require("./models/StudentRegistration");
    } else if (userType === "Rector") {
      model = require("./models/RectorRegistration");
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const user = await model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      userType: userType.toLowerCase(),
    };

    res.status(200).json({
      message: "Login successful",
      email: user.email,
      name: user.name,
      userType: userType.toLowerCase(),
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Logout
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// ✅ Get Logged-in User
app.get("/me", (req, res) => {
  if (req.session.user) {
    return res.status(200).json({ user: req.session.user });
  }
  res.status(401).json({ message: "Not logged in" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
