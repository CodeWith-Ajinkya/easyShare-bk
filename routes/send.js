const router = require("express").Router();
const File = require("../models/file");
const sendMail = require("../services/emailServices");
const emailTemplate = require("../services/emailTemplate");

router.post("/", async (req, res) => {
    const { uuid, emailTo, emailFrom } = req.body;

    if (!uuid || !emailTo || !emailFrom)
        return res.status(422).json({ error: "All fields required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTo) || !emailRegex.test(emailFrom)) {
        return res.status(422).json({ error: "Invalid email format" });
    }

    try {
        const file = await File.findOne({ uuid: String(uuid) });

        if (!file) return res.status(404).json({ error: "File not found" });

        if (file.sender)
            return res.status(422).json({ error: "Email already sent once" });

        file.sender = emailFrom;
        file.receiver = emailTo;
        await file.save();

        // FORCE use of APP_BASE_URL - ensuring it falls back to the production URL if env is missing locally
        const baseUrl = process.env.FINAL_RENDER_URL || process.env.APP_BASE_URL || "https://easyshare-backend-cidx.onrender.com";
        if (!baseUrl) {
            console.error("FATAL ERROR: APP_BASE_URL is missing!");
            return res.status(500).json({ error: "Server configuration missing" });
        }
        const downloadLink = `${baseUrl}/files/${file.uuid}`;

        // Uses the configured system email for sending to hide personal email
        const systemSender = process.env.MAIL_USER;

        console.log(`Sending email. Download link base: ${baseUrl}`);

        await sendMail({
            from: systemSender, // Use system email for Reply-To as well
            to: emailTo,
            subject: "easyShare File Sharing",
            text: `${systemSender} shared a file with you. Download it here: ${downloadLink}`,
            html: emailTemplate({
                emailFrom: systemSender, // Display system email in template
                downloadLink: downloadLink,
                size: `${parseInt(file.size / 1000)} KB`,
                expires: "24 hours"
            })
        });


        return res.json({ success: true });


    } catch (err) {
        console.error("Email route error:", err);
        return res.status(500).json({ error: "Server failed!" });
    }
});

module.exports = router;
