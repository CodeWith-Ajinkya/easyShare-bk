const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async ({ from, to, subject, text, html }) => {
    const senderEmail = process.env.MAIL_USER;

    if (!senderEmail) {
        console.error("FATAL ERROR: MAIL_USER environment variable is not set!");
        throw new Error("Sender email config missing");
    }

    console.log(`Sending email from: ${senderEmail} to: ${to}`);

    const msg = {
        to,
        from: { email: senderEmail, name: "EasyShare" },
        replyTo: from, // The user's input email
        subject,
        text,
        html
    };

    const response = await sgMail.send(msg);
    console.log("Email sent:", response[0].statusCode);
};
