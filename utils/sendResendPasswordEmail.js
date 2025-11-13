import nodemailer from 'nodemailer';

const sendResetPasswordEmail = async (email, code) => {
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
    subject: 'Reset your password',
    html: `
      <h2>Password Reset Code</h2>
      <p>Enter this 5-digit code to reset your password:</p>
      <h1 style="letter-spacing: 5px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

export default sendResetPasswordEmail;