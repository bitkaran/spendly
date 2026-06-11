import nodemailer from 'nodemailer';

// Generate a random 6-digit numeric string
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Setup Mail Transporter based on env
const createTransporter = () => {
  const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

// Send OTP email or log it to the console
export const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  if (transporter) {
    const mailOptions = {
      from: `"Spendly Finance" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your Spendly Account - OTP Verification',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px; text-align: center; font-size: 28px; font-weight: bold;">Spendly</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">Thank you for registering on <strong>Spendly</strong>! Please use the following One-Time Password (OTP) to activate your account and access your premium dashboard. This code will expire in 10 minutes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #cbd5e1; display: inline-block;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.5;">If you did not request this code, please ignore this email or contact support.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Spendly Inc. &bull; Sharma Farm House, New Delhi, India &bull; Blue Trove India LLP</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Real OTP Email sent to ${email}`);
  } else {
    // Development fallback
    console.log('\n==================================================');
    console.log(`[DEV MODE] OTP verification required for User:`);
    console.log(`Recipient Email: ${email}`);
    console.log(`OTP Code:        ${otp}`);
    console.log('==================================================\n');
  }
};

// Send OTP email for forgot password
export const sendForgotPasswordEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  if (transporter) {
    const mailOptions = {
      from: `"Spendly Finance" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your Spendly Password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px; text-align: center; font-size: 28px; font-weight: bold;">Spendly</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">We received a request to reset your password. Use the following One-Time Password (OTP) code to verify your identity. This code will expire in 10 minutes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #b91c1c; background-color: #fef2f2; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fca5a5; display: inline-block;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.5;">If you did not request a password reset, please change your password immediately or contact support.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Spendly Inc. &bull; Sharma Farm House, New Delhi, India</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Forgot Password OTP Email sent to ${email}`);
  } else {
    // Development fallback
    console.log('\n==================================================');
    console.log(`[DEV MODE] Forgot Password Reset OTP for User:`);
    console.log(`Recipient Email: ${email}`);
    console.log(`OTP Code:        ${otp}`);
    console.log('==================================================\n');
  }
};
