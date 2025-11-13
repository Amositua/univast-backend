import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    // destination: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Destination", 
    //   required: true,
    // },
    destinationId: { 
      type: String, 
      required: true 
    },
    bookingDate: {
      type: Date,
      default: Date.now, 
    },
    visitDate: {
      type: Date,
      required: true, 
    },
    // visitTime: {
    //   type: String,
    //   required: true, 
    // },
    numberOfAdult: {
      type: Number,
      required: true,
      // min: 1,
    },
    numberOfChildren: {
      type: Number,
      required: true,
      // min: 1,
    },
    totalPrice: {
      type: Number,
      required: true, // calculated from price * guests, etc.
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    amountPaid: {
      type: Number,
      default: 0, 
    },
    currency: {
      type: String,
      default: "USD", 
    },

    // specialRequests: {
    //   type: String,
    // },
    transactionId: {
      type: String, // for payment gateway tracking
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
