const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async ({ from, to, subject, text, html }) => {
    const msg = {
        to,
        from: { email: process.env.MAIL_USER, name: "EasyShare" },
        replyTo: from, // The user's email
        subject,
        text,
        html
    };

    const response = await sgMail.send(msg);
    console.log("Email sent:", response[0].statusCode);
};
