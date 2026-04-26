// import User from "../models/User.js";
// import Car from "../models/Car.js";
// import jwt from "jsonwebtoken";
// import { sendEmail } from "../configs/sendEmail.js";

// // ✅ Generate Token
// const generateToken = (userId) => {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//         expiresIn: "7d",
//     });
// };

// // ✅ REGISTER
// // export const registerUser = async (req, res) => {
// //     try {
// //         const { name, email, password, role } = req.body;

// //         const user = await User.create({
// //             name,
// //             email,
// //             password,
// //             role: role || "user",
// //         });

// //         const token = generateToken(user._id);

// //         res.json({ success: true, token });
// //     } catch (error) {
// //         res.json({ success: false, message: error.message });
// //     }
// // };
// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || "user",
//     });

//     const token = generateToken(user._id);

//     // 👇 Determine role text
//     const roleText = user.role === "owner" ? "Owner" : "User";

//     // ==============================
//     // 📧 SEND WELCOME EMAIL WITH ROLE
//     // ==============================
//     try {
//       await sendEmail({
//         to: email,
//         subject: "Welcome to Car Resale 🚗",
//         html: `
//           <h2>Welcome, ${name} 👋</h2>
          
//           <p>Your account has been successfully created.</p>
          
//           <p><strong>Account Type:</strong> ${roleText}</p>

//           ${
//             user.role === "owner"
//               ? `<p>You can now list and manage cars on the platform.</p>`
//               : `<p>You can now browse and purchase cars.</p>`
//           }

//           <br/>
//           <p>Happy Driving 🚗💨</p>
//         `,
//       });
//     } catch (error) {
//       console.log("Email failed:", error.message);
//     }

//     res.json({ success: true, token });

//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // ✅ LOGIN
// export const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.json({ success: false, message: "User not found" });
//         }

//         const token = generateToken(user._id);

//         res.json({ success: true, token });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// // ✅ GET USER DATA
// export const getUserData = async (req, res) => {
//     try {
//         res.json({ success: true, user: req.user });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };

// // ✅ GET CARS
// export const getCars = async (req, res) => {
//     try {
//         // Fetch all cars (not just available) to display in frontend
//         const cars = await Car.find().sort({ createdAt: -1 });
//         res.json({ success: true, cars });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// };
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

    // 🔐 PASSWORD VALIDATION
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message:
          "Password must be 8+ chars with letter, number & symbol",
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
    await sendEmail({
      to: email,
      subject: "Welcome to Car Resale 🚗",
      html: `<h2>Welcome ${name}</h2><p>Account created successfully</p>`,
    });

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

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
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

    // 🔢 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP 🔐",
      html: `
        <h2>Your OTP: ${otp}</h2>
        <p>Valid for 10 minutes</p>
      `,
    });

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

    // 🔐 Validate new password
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.json({
        success: false,
        message: "Weak password",
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
// ✅ GET USER
// ==============================
export const getUserData = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ==============================
// ✅ GET CARS
// ==============================
export const getCars = async (req, res) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  res.json({ success: true, cars });
};