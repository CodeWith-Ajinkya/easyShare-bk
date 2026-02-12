const router = require("express").Router();
const File = require("../models/file");
const path = require("path");
const fs = require("fs");

router.get("/:uuid", async (req, res) => {
    try {
        const file = await File.findOne({ uuid: String(req.params.uuid) });

        if (!file) {
            return res.status(404).json({ error: "Link expired" });
        }

        // Check Expiry
        if (new Date() > file.expiryAt) {
            return res.status(410).json({ error: "Link expired" });
        }

        const filePath = path.join(__dirname, "..", file.path);
        return res.download(filePath);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
