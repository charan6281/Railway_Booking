const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Station', schema);
