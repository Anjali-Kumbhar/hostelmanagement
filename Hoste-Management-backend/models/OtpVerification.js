const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
