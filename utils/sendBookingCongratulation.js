import nodemailer from 'nodemailer';

const sendBookingCongratulation = async (email, name, booking) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"UNIVAST" <no-reply@richtech.com>',
    to: email,
    subject: `🎉 Congratulations ${name}! Your Booking Was Successful`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
        <h2 style="color: #1A2B4C;">Congratulations, ${name}! 🎉</h2>
        
        <p>We’re excited to let you know that your payment was successful and your booking has been confirmed.</p>
        
        <h3 style="color: #FF9A3D; margin-top: 20px;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking ID</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Destination</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.destinationName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.visitDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.status}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">We can’t wait to see you enjoy your trip. 🌍</p>
        
        <p style="font-weight: bold;">– The UNIVAST Team</p>
      </div>
    `,
  });
};

export default sendBookingCongratulation;
