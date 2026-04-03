const mongoose = require('mongoose');

const resourceDataSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['electricity', 'water', 'wifi', 'waste'], required: true },
    value: { type: Number, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    isFullDay: { type: Boolean, default: true },
    startTime: { type: String }, // e.g., "10:30"
    endTime: { type: String },   // e.g., "14:15"
    department: { type: String, required: true }
});

const ResourceData = mongoose.model('ResourceData', resourceDataSchema);
module.exports = ResourceData;
