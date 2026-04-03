const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    level: { type: String, enum: ['warning', 'critical'], required: true },
    timestamp: { type: Date, default: Date.now },
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
