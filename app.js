import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes  from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch(err => console.error("MongoDB connection error:", err));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use("/api/bookings", bookingRoutes);

// IMPORTANT: Flutterwave sends JSON, so body-parser must parse raw JSON
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

export default app;