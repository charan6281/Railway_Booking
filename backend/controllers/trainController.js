const Train = require('../models/Train');
const Station = require('../models/Station');
const Schedule = require('../models/Schedule');

exports.stations = async (req, res) => res.json(await Station.find().sort('name'));
exports.search = async (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to || !date) return res.status(400).json({ message: 'From, destination and journey date are required.' });
  const source = await Station.findOne({ $or: [{ code: from.toUpperCase() }, { name: new RegExp(`^${from}$`, 'i') }] });
  const destination = await Station.findOne({ $or: [{ code: to.toUpperCase() }, { name: new RegExp(`^${to}$`, 'i') }] });
  if (!source || !destination || source.id === destination.id) return res.json([]);
  const trains = await Train.find({ source: source._id, destination: destination._id, active: true }).populate('source destination');
  const day = new Date(`${date}T00:00:00.000Z`);
  const results = await Promise.all(trains.map(async train => {
    let schedule = await Schedule.findOne({ train: train._id, journeyDate: day });
    if (!schedule) schedule = await Schedule.create({ train: train._id, journeyDate: day, availability: train.classes.map(c => ({ code: c.code, seats: c.totalSeats })) });
    return { ...train.toObject(), scheduleId: schedule._id, availability: schedule.availability };
  }));
  res.json(results);
};
exports.list = async (req, res) => res.json(await Train.find().populate('source destination'));
exports.create = async (req, res) => res.status(201).json(await Train.create(req.body));
exports.update = async (req, res) => res.json(await Train.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
exports.remove = async (req, res) => { await Train.findByIdAndDelete(req.params.id); res.json({ message: 'Train deleted.' }); };
