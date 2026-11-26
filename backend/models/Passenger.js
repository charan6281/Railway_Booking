const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 1, max: 120 },
  gender: { type: String, enum: ['Male','Female','Other'], required: true },
  preference: { type: String, default: 'No preference' }
});
module.exports = mongoose.model('Passenger', schema);
