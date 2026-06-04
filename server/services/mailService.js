import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔍 verify once
transporter.verify((err, success) => {
  if (err) console.log("❌ Mail Error:", err);
  else console.log("✅ Mail server ready");
});

export const sendRSIMail = async (html) => {
  await transporter.sendMail({
    from: `"AI Screener" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: "📊 RSI Screener Update",
    html
  });
};