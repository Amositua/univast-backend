import axios from "axios";
import Booking from "../models/Booking.js";
// import Destination from "../models/Destination.js";
import { generatePaymentLink, verifyTransaction } from "../services/flutterwaveServices.js";
// import sendBookingCongratulation from '../utils/sendBookingCongratulation.js';

// Create booking + generate payment link
// export const createBooking = async (req, res) => {
//   try {
//     const { destinationId, visitDate, numberOfAdult, numberOfChildren, price, } = req.body;

//     // const destination = await Destination.findById(destinationId);
//     // if (!destination) {
//     //   return res.status(404).json({ message: "Destination not found" });
//     // }

//     // const totalPrice = destination.price * numberOfGuests;
//     const totalPrice = price ;
  
//     const booking = await Booking.create({
//       user: req.user.id,
//       destinationId: destinationId,
//     //destination: destination._id,
//       visitDate,
//       // visitTime,
//       numberOfAdult,
//       numberOfChildren,
//       totalPrice,
//     });
//     console.log(booking);
//     // Generate Flutterwave payment link
//     // const { link, tx_ref } = await generatePaymentLink(booking, req.user);

//     // booking.transactionId = tx_ref;
//     await booking.save();

//     // res.status(201).json({ booking, paymentLink: link });
//     res.status(201).json({ sucess: 'success', booking });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Create booking + generate payment link
export const createBooking = async (req, res) => {
  try {
      const { destinationId, visitDate, numberOfAdult, numberOfChildren, price, } = req.body;

    // const destination = await Destination.findById(destinationId);
    // if (!destination) {
    //   return res.status(404).json({ message: "Destination not found" });
    // }

     const totalPrice = price ;
  
    const booking = await Booking.create({
      user: req.user.id,
      destinationId: destinationId,
    //destination: destination._id,
      visitDate,
      // visitTime, 
      numberOfAdult,
      numberOfChildren,
      totalPrice,
    });
    console.log(booking);

    // Generate Flutterwave payment link
    const { link, tx_ref } = await generatePaymentLink(booking, req);

    booking.transactionId = tx_ref;
    await booking.save();

    res.status(201).json({ booking, paymentLink: link });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// initiatePayment
// export const initiatePayment = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });
//     const { link, tx_ref } = await generatePaymentLink(booking, req);
//     booking.transactionId = tx_ref;
//     await booking.save();
//     res.json({ link });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Payment initiation failed" });
//   }
// };

// Flutterwave webhook handler
export const flutterwaveWebhook = async (req, res) => {
  
  console.log("Headers:", req.headers);
  console.log("FLW_SECRET_HASH:", process.env.FLW_SECRET_HASH);
  try {
    const secretHash = process.env.FLW_SECRET_HASH; // set this in .env
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      return res.status(401).json({ message: "Invalid signature" });
    }
    console.log("Webhook hit:", req.body);
    const payload = req.body;
    const {amount, currency, txRef, status } = payload; 

    const booking = await Booking.findOne({ transactionId: txRef });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (status === "successful") {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.amountPaid = amount;
      booking.currency = currency;
      await booking.save();
    } else {
      booking.paymentStatus = "unpaid";
      booking.status = "pending";
      await booking.save();
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref, status } = req.query;

    console.log('PAYMENT VERIFICATION:', { transaction_id, tx_ref, status });

    if (status === 'successful' && transaction_id) {
      // Verify the transaction with Flutterwave
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
          }
        }
      );

    console.log('VERIFICATION RESPONSE:', response.data);

    const payload = response.data.data;
    const {amount, currency, tx_ref, status } = payload; 

    const booking = await Booking.findOne({ transactionId: tx_ref });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
 
    if (status === "successful") {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.amountPaid = amount;
      booking.currency = currency;
      await booking.save();
    } else {
      booking.paymentStatus = "unpaid";
      booking.status = "pending";
      await booking.save();
    }

    res.json({
          success: true,
          message: 'Payment verified successfully',
          data: response.data.data
        });
    // sendBookingCongratulation(req.user.email, req.user.name, booking);
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment was not successful'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: error.message
    });
  }
};

// Verify transaction manually (optional)
// export const verifyPayment = async (req, res) => {
//   try {
//     const { transactionId } = req.body;
//     const response = await verifyTransaction(transactionId);

//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc Get booking details (for checkout page)
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email");
      // .populate("destination");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("user", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").populate("destination");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
