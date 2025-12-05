export const emailVerificationTemplate = (verificationUrl) => `
  <div style="font-family: sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto;">
    <h2>Welcome! Please verify your email address</h2>
    <p>Thank you for registering with our Internship Management System. To complete your registration, please verify your email address by clicking the button below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}"
         style="background-color: #2e6fa7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Verify Email Address
      </a>
    </div>

    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>

    <p>This link will expire in 24 hours for security reasons.</p>

    <p>If you didn't create an account, please ignore this email.</p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #666; font-size: 12px;">
      This is an automated message from Internship Management System. Please do not reply to this email.
    </p>
  </div>
`;
