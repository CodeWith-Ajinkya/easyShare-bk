const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1000 * 1000 * 100 } // 100MB
}).single("myfile");

router.post("/", (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // Fixed 24 hour expiry for simplicity
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size,
            password: null,
            expiryAt: expiryDate,
            isOneTime: false
        });

        try {
            const saved = await file.save();

            // RENAME to a unique name to ensure no system override
            const baseUrl = process.env.FINAL_RENDER_URL || process.env.APP_BASE_URL;

            if (!baseUrl) {
                console.error("FATAL ERROR: FINAL_RENDER_URL is missing in .env!");
                return res.status(500).json({ error: "Server configuration error" });
            }

            console.log(`[DEBUG] Generating link with Base: ${baseUrl}`);

            return res.json({
                file: `VERIFIED_LINK:${baseUrl}/files/${saved.uuid}`,
                uuid: saved.uuid,
                debug: "FIXED_VERSION_FINAL"
            });


        } catch (err) {
            console.error("Database save error:", err);
            return res.status(500).json({ error: "Database error" });
        }
    });
});

module.exports = router;
