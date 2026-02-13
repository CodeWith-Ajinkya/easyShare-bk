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

        // FORCE use of APP_BASE_URL
        const baseUrl = process.env.APP_BASE_URL;
        if (!baseUrl) {
            console.error("FATAL ERROR: APP_BASE_URL is missing!");
            return res.status(500).json({ error: "Server configuration missing" });
        }
        const downloadLink = `${baseUrl}/files/${file.uuid}`;

        console.log(`Sending email. Download link base: ${baseUrl}`);

        await sendMail({
            from: emailFrom,
            to: emailTo,
            subject: "easyShare File Sharing",
            text: `${emailFrom} shared a file with you. Download it here: ${downloadLink}`,
            html: emailTemplate({
                emailFrom,
                downloadLink: downloadLink,
                size: `${parseInt(file.size / 1000)} KB`,
                expires: "24 hours"
            })
        });


        return res.json({ success: true });


    } catch (err) {
        return res.status(500).json({ error: "Server failed!" });
    }
});

module.exports = router;
