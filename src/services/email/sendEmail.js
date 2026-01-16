import { transporter } from "./transporter.js";

export const sendEmail = async ({ to, subject, template }) => {
  try {
    const info = await transporter.sendMail({
      from: `"IMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: template,
    });
    return true;
  } catch (error) {
    return false;
  }
};
