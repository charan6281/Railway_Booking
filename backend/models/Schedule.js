const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  journeyDate: { type: Date, required: true },
  availability: [{ code: String, seats: { type: Number, min: 0 } }]
}, { timestamps: true });
schema.index({ train: 1, journeyDate: 1 }, { unique: true });
module.exports = mongoose.model('Schedule', schema);
