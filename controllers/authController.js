import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import { generateAccessToken } from '../utils/token.js';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import sendResetPasswordEmail from '../utils/sendResendPasswordEmail.js';
import sendCongratulationEmail from '../utils/sendCongratulationEmail.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;
 
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    // const duplicatePhone = await User.findOne({ phone });
    // if (duplicatePhone) return res.status(400).json({ message: 'Phone number already in use' });
    
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const user = await User.create({
      name,
      email,
      // education,
      password,
      verificationCode,
      verificationCodeExpires: codeExpires,
    });
   
    // Send email with better error handling
    try {
      await sendVerificationEmail(email, verificationCode);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Delete the user if email fails
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again.',
        error: emailError.message 
      });
    }
    
    res.status(201).json({ 
      message: 'Verification code sent to email.', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        // education: user.education 
      }, 
      // token: '123456' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.verified) {
    return res.status(401).json({ message: 'Email not verified' });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = generateAccessToken(user);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Valid:', decoded);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('❌ Token has expired');
    } else {
      console.log('❌ Invalid token');
    }
  }

  res.status(200).json({
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    token,
  });
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: 'user not found' });
  }

  if (user.verified) {
    return res.status(400).json({ message: 'Email already verified.' });
  }

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < new Date()
  ) {
    return res.status(400).json({ message: 'wrong or expired verification code.' });
  }

  user.verified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Email verified successfully.' });
  sendCongratulationEmail(email, user.name);
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetCode = code;
  user.resetCodeExpires = expires;
  await user.save();

  await sendResetPasswordEmail(email, code);

  res.status(200).json({ message: 'Reset code sent to email.' });
};

export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired reset code.' });
  }

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Password has been reset successfully.' });
};

export const resendEmailVerificationCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.verified) {
    return res.status(400).json({ message: 'User not found or already verified.' });
  }

  const newCode = Math.floor(10000 + Math.random() * 90000).toString();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.verificationCode = newCode;
  user.verificationCodeExpires = newExpiry;
  await user.save();

  await sendVerificationEmail(email, newCode);

  res.status(200).json({ message: 'Code resent.' });
};

export const resendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.verified) {
    return res.status(400).json({ message: 'User not found or not verified.' });
  }

  const newCode = Math.floor(10000 + Math.random() * 90000).toString();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetCode = newCode;
  user.resetCodeExpires = newExpiry;
  await user.save();

  await sendResetPasswordEmail(email, newCode);

  res.status(200).json({ message: 'Reset code resent to email.' });
};
