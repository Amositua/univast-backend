import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
 console.log('Sending email to:', email);
  await transporter.sendMail({
      from: `"UNIVAST" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Your UNIVAST verification code</h2>
        <p>Enter this code in the app to verify your email:</p>
        <h1 style="letter-spacing: 6px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    });
};

export default sendVerificationEmail;



// import nodemailer from 'nodemailer';

// const sendVerificationEmail = async (email, code) => {
//   // Validate environment variables first
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     throw new Error('Email credentials not configured');
//   }

//   console.log('Attempting to send email...');
//   console.log('SMTP Host: live.smtp.mailtrap.io:587');
//   console.log('From:', process.env.EMAIL_USER);

//   const transporter = nodemailer.createTransport({
//     host: 'live.smtp.mailtrap.io',
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//       rejectUnauthorized: false
//     },
//     connectionTimeout: 60000, // 60 seconds
//     greetingTimeout: 30000,
//     socketTimeout: 60000,
//     logger: true, // Enable logging
//     debug: true   // Show SMTP traffic
//   });

//   // Verify connection with timeout
//   try {
//     console.log('Verifying SMTP connection...');
//     await transporter.verify();
//     console.log('✅ SMTP connection verified successfully');
//   } catch (error) {
//     console.error('❌ SMTP verification failed:', error);
//     console.error('Error code:', error.code);
//     console.error('Error command:', error.command);
//     throw new Error(`SMTP verification failed: ${error.message}`);
//   }

//   try {
//     console.log('Sending email to:', email);
//     const info = await transporter.sendMail({
//       from: `"UNIVAST" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Verify Your Email',
//       html: `
//         <h2>Your UNIVAST verification code</h2>
//         <p>Enter this code in the app to verify your email:</p>
//         <h1 style="letter-spacing: 6px;">${code}</h1>
//         <p>This code expires in 10 minutes.</p>
//       `,
//     });
//     console.log('✅ Email sent successfully:', info.messageId);
//     return info;
//   } catch (error) {
//     console.error('❌ Failed to send email:', error);
//     throw error;
//   }
// };

// export default sendVerificationEmail;