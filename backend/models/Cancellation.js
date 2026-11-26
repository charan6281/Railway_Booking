const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  pnr: { type: String, required: true },
  reason: { type: String, default: 'Cancelled by passenger' },
  refundAmount: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Cancellation', schema);
