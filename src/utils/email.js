const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send notification to admin when a form is submitted
 */
const notifyAdmin = async ({ subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to:   process.env.ADMIN_EMAIL,
    subject,
    html,
  });
};

/**
 * Send reply email to a user
 */
const replyToUser = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { notifyAdmin, replyToUser };
