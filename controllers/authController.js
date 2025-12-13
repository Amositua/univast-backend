import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "../utils/db.js";

import { generateAccessToken } from "../utils/token.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import sendResetPasswordEmail from "../utils/sendResendPasswordEmail.js";
import sendCongratulationEmail from "../utils/sendCongratulationEmail.js";
import { create } from "domain";

/* ========================= REGISTER ========================= */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await connectDB(); // ✅ DB CONNECT

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const verificationCode = Math.floor(
      10000 + Math.random() * 90000
    ).toString();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires: codeExpires,
      createdAt: new Date(),
    });

    try {
      await sendVerificationEmail(email, verificationCode);
      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        error: emailError.message,
      });
    }

    res.status(201).json({
      message: "Verification code sent to email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  await connectDB(); // ✅ DB CONNECT

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.verified) {
    return res.status(401).json({ message: "Email not verified" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateAccessToken(user);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Valid:", decoded);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("❌ Token has expired");
    } else {
      console.log("❌ Invalid token");
    }
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    token,
  });
};

/* ========================= VERIFY EMAIL ========================= */
export const verifyEmail = async (req, res) => {
  await connectDB(); // ✅ DB CONNECT

  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  if (user.verified) {
    return res.status(400).json({ message: "Email already verified." });
  }

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < new Date()
  ) {
    return res
      .status(400)
      .json({ message: "wrong or expired verification code." });
  }

  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Email verified successfully." });
  sendCongratulationEmail(email, user.name);
};

/* ========================= FORGOT PASSWORD ========================= */
export const forgotPassword = async (req, res) => {
  await connectDB(); // ✅ DB CONNECT

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetCode = code;
  user.resetCodeExpires = expires;
  await user.save();

  await sendResetPasswordEmail(email, code);

  res.status(200).json({ message: "Reset code sent to email." });
};

/* ========================= RESET PASSWORD ========================= */
export const resetPassword = async (req, res) => {
  await connectDB(); // ✅ DB CONNECT

  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: "Invalid or expired reset code." });
  }

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password has been reset successfully." });
};

/* ========================= RESEND EMAIL CODE ========================= */
export const resendEmailVerificationCode = async (req, res) => {
  await connectDB(); // ✅ DB CONNECT

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.verified) {
    return res
      .status(400)
      .json({ message: "User not found or already verified." });
  }

  const newCode = Math.floor(10000 + Math.random() * 90000).toString();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = newCode;
  user.verificationCodeExpires = newExpiry;
  await user.save();

  await sendVerificationEmail(email, newCode);

  res.status(200).json({ message: "Code resent." });
};

/* ========================= RESEND RESET CODE ========================= */
export const resendForgotPasswordCode = async (req, res) => {
  await connectDB(); // ✅ DB CONNECT

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.verified) {
    return res.status(400).json({ message: "User not found or not verified." });
  }

  const newCode = Math.floor(10000 + Math.random() * 90000).toString();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetCode = newCode;
  user.resetCodeExpires = newExpiry;
  await user.save();

  await sendResetPasswordEmail(email, newCode);

  res.status(200).json({ message: "Reset code resent to email." });
};

/* ========================= UPDATE PROFILE ========================= */
export const updateProfile = async (req, res) => {
  try {
    await connectDB(); // ✅ DB CONNECT

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;
    const { name, password } = req.body;

    const updateData = { name };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
