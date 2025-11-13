import axios from "axios";

export const generatePaymentLink = async (booking, req) => {
  const tx_ref = `BOOKING-${booking._id}-${Date.now()}`;

  const payload = {
    tx_ref,
    amount: 1000,
    currency: "NGN",
      redirect_url: "http://10.32.163.222:5000/payment-success",
    // redirect_url: `${req.protocol}://${req.get('host')}/api/bookings/verify-payment`,
    // redirect_url: "https://localhost:5000/payment-failed",
    // payment_options: "card,mobilemoney,ussd",
    customer: {
      name: req.user.name || "Anonymous",
      email: req.user.email || "test@example.com",
      // phonenumber: user.phone || "0000000000",
    },
    customizations: {
      title: "Discover Afrika Booking",
      description: `Payment for booking ${booking._id}`,
    },
  };

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    // Flutterwave returns "data.link"
    return { link: response.data.data.link, tx_ref };
  } catch (error) {
    console.error("Flutterwave error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyTransaction = async (transactionId) => {
  return await flw.Transaction.verify({ id: transactionId });
};
