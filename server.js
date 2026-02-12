require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");


const app = express();

const fs = require("fs");

// Connect DB
connectDB();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Disable if you have issues with CDN/EJS inline scripts, otherwise keep enabled
}));
app.use(mongoSanitize());

const envAllowed = process.env.ALLOWED_CLIENTS;
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = envAllowed && envAllowed !== "*"
            ? [...envAllowed.split(",").map(item => item.trim()), "https://easyshare-frontend-36lu.onrender.com"]
            : ["*"];

        // If wildcard, allow all
        if (allowedOrigins.includes("*")) {
            return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,POST,OPTIONS",
    credentials: true
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health Check
app.get("/health", (req, res) => res.status(200).json({ status: "OK", timestamp: new Date() }));

// Static

app.use(express.static("public"));
// Note: /uploads is NOT served as static for security (access handled by routes)

// Template engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
app.use("/api/files", require("./routes/files"));
app.use("/api/files/send", require("./routes/send"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Cleanup expired files every hour
    setInterval(async () => {
        const File = require("./models/file");
        try {
            const expiredFiles = await File.find({ expiryAt: { $lt: new Date() } });
            if (expiredFiles.length > 0) {
                for (const file of expiredFiles) {
                    try {
                        const filePath = path.join(__dirname, file.path);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                        await File.deleteOne({ _id: file._id });
                        console.log(`Cleaned up expired file: ${file.filename}`);
                    } catch (err) {
                        console.error(`Error cleaning up file ${file.filename}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error("Cleanup interval error:", err);
        }
    }, 60 * 60 * 1000); // Check every 1 hour
});
