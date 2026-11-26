const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, default: 'Administrator' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: 'admin' }
}, { timestamps: true });
module.exports = mongoose.model('Admin', schema);
