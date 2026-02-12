const router = require("express").Router();
const File = require("../models/file");

router.get("/:uuid", async (req, res) => {
    try {
        const file = await File.findOne({ uuid: String(req.params.uuid) });

        if (!file) {
            return res.render("download", { error: "Link expired or never existed." });
        }

        // Check Expiry (Fixed 24hr logic still applies for safety)
        if (new Date() > file.expiryAt) {
            return res.render("download", { error: "This link has expired." });
        }

        res.render("download", {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            error: null
        });

    } catch (err) {
        console.error(err);
        return res.render("download", { error: "Something went wrong" });
    }
});

module.exports = router;
