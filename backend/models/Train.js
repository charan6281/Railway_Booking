const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  classes: [{
    code: { type: String, enum: ['SL','3A','2A','1A'], required: true },
    fare: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 0 }
  }],
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Train', schema);
