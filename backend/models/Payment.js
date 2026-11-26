const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, enum: ['UPI','Debit Card','Credit Card'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Success','Failed'], required: true },
  reference: { type: String, required: true, unique: true }
}, { timestamps: true });
module.exports = mongoose.model('Payment', schema);
