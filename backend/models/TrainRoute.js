const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  sequence: { type: Number, required: true },
  arrival: String,
  departure: String,
  day: { type: Number, default: 1 }
}, { timestamps: true });
schema.index({ train: 1, sequence: 1 }, { unique: true });
module.exports = mongoose.model('TrainRoute', schema);
