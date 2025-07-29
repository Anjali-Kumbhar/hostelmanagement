const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  staffId: {
    type: String,
    required: true,
    unique: true, // assuming each staffId must be unique
  },

  staffType: {
    type: String,
    enum: ["staff", "cc", "tg"],
    required: true,
  },

  deptName: {
    type: String,
    required: true,
  },

  tgYear: {
    type: String,
    enum: ["FY", "SY", "TY", "BE"],
  },

  tgBatch: {
    type: String,
    enum: [
      "F1", "F2", "F3",
      "S1", "S2", "S3",
      "T1", "T2", "T3",
      "B1", "B2", "B3"
    ],
  },

  phone: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("TempUser", tempUserSchema);
