import User from "../models/User.js";
import Car from "../models/Car.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../configs/sendEmail.js";

// ==============================
// 🔑 TOKEN
// ==============================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==============================
// ✅ REGISTER
// ==============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // 🔐 PASSWORD VALIDATION
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message: "Password must be 8+ chars with letter, number & symbol",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = generateToken(user._id);

    // 📧 Welcome Email
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Car Resale 🚗",
        html: `<h2>Welcome, ${name}!</h2><p>Your Car Resale account was created successfully as a <strong>${user.role}</strong>.</p><p>Explore marketplace listings and real-time AI valuations.</p>`,
      });
    } catch (mailErr) {
      console.warn("Welcome email failed:", mailErr.message);
    }

    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ LOGIN
// ==============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==============================
// 🔥 SEND OTP (FORGOT PASSWORD)
// ==============================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: "Password Reset OTP 🔐",
        html: `<h2>Your OTP: ${otp}</h2><p>This code is valid for 10 minutes.</p>`,
      });
    } catch (mailErr) {
      console.warn("OTP email failed:", mailErr.message);
    }

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==============================
// 🔥 VERIFY OTP + RESET PASSWORD
// ==============================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.json({
        success: false,
        message: "Password must be 8+ chars with letter, number & symbol",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==============================
// ✅ GET USER DATA
// ==============================
export const getUserData = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ==============================
// ✅ GET CARS
// ==============================
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};