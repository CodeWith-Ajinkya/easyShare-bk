const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    uuid: { type: String, required: true, index: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    sender: { type: String },
    receiver: { type: String },
    password: { type: String },
    expiryAt: { type: Date, required: true, index: true },
    isOneTime: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
