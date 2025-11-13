import Flutterwave from "flutterwave-node-v3";
import dotenv from 'dotenv';

dotenv.config();

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


// @desc Initiate payment with Flutterwave
export const initiatePayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const payload = {
      tx_ref: `booking-${booking._id}-${Date.now()}`,
      amount: booking.totalPrice,
      currency: "NGN",
      redirect_url: `${process.env.FRONTEND_URL}/payment-success`,
      customer: {
        email: req.user.email,
        name: req.user.name,
      },
      customizations: {
        title: "Discover Afrika Booking",
        description: `Payment for booking ${booking._id}`,
      },
    };

    
     // booking.transactionId = tx_ref;
    // await booking.save();

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};