const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  pnr: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  journeyDate: { type: Date, required: true },
  travelClass: { type: String, required: true },
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Passenger' }],
  fare: { type: Number, required: true },
  status: { type: String, enum: ['Pending Payment','Confirmed','Waiting List','Cancelled'], default: 'Pending Payment' },
  paymentStatus: { type: String, enum: ['Pending','Paid','Failed','Refunded'], default: 'Pending' }
}, { timestamps: true });
schema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model('Booking', schema);
