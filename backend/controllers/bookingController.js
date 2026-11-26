const mongoose = require('mongoose');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Passenger = require('../models/Passenger');
const Train = require('../models/Train');
const Schedule = require('../models/Schedule');
const Payment = require('../models/Payment');
const Cancellation = require('../models/Cancellation');

function makePNR() { return String(1000000000 + crypto.randomInt(0, 9000000000)); }

exports.create = async (req, res) => {
  const { trainId, scheduleId, journeyDate, travelClass, passengers } = req.body;
  if (!mongoose.isValidObjectId(trainId) || !mongoose.isValidObjectId(scheduleId) || !Array.isArray(passengers) || !passengers.length || passengers.length > 6)
    return res.status(400).json({ message: 'Select a valid train and schedule. Add 1 to 6 passengers.' });
  const train = await Train.findById(trainId);
  const schedule = await Schedule.findById(scheduleId);
  if (!train || !schedule || String(schedule.train) !== String(train._id)) return res.status(404).json({ message: 'Train schedule not found.' });
  const cls = train.classes.find(c => c.code === travelClass);
  const available = schedule.availability.find(a => a.code === travelClass);
  if (!cls || !available) return res.status(400).json({ message: 'Selected class is not available.' });
  if (available.seats < passengers.length) return res.status(409).json({ message: 'Not enough seats available.' });
  const cleaned = passengers.map(p => ({ name: String(p.name || '').trim(), age: Number(p.age), gender: p.gender, preference: p.preference || 'No preference' }));
  if (cleaned.some(p => !p.name || !Number.isInteger(p.age) || p.age < 1 || p.age > 120 || !['Male','Female','Other'].includes(p.gender)))
    return res.status(400).json({ message: 'Please enter valid passenger details.' });
  const session = await mongoose.startSession();
  let booking;
  try {
    await session.withTransaction(async () => {
      const update = await Schedule.updateOne({ _id: schedule._id, availability: { $elemMatch: { code: travelClass, seats: { $gte: passengers.length } } } },
        { $inc: { 'availability.$.seats': -passengers.length } }, { session });
      if (!update.modifiedCount) throw Object.assign(new Error('Seats were just booked by someone else. Search again.'), { status: 409 });
      const docs = await Passenger.insertMany(cleaned, { session });
      booking = (await Booking.create([{ pnr: makePNR(), user: req.account._id, train: train._id, schedule: schedule._id,
        journeyDate: new Date(journeyDate), travelClass, passengers: docs.map(p => p._id), fare: cls.fare * docs.length }], { session }))[0];
    });
  } finally { await session.endSession(); }
  res.status(201).json(await Booking.findById(booking._id).populate('train passengers'));
};

exports.mine = async (req, res) => res.json(await Booking.find({ user: req.account._id }).populate('train passengers').sort({ createdAt: -1 }));
exports.pnr = async (req, res) => {
  const booking = await Booking.findOne({ pnr: req.params.pnr }).populate('train passengers');
  if (!booking) return res.status(404).json({ message: 'No booking found for this PNR.' });
  res.json(booking);
};
exports.pay = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.account._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Cancelled bookings cannot be paid.' });
  if (booking.paymentStatus === 'Paid') return res.json({ message: 'This booking is already paid.', booking });
  const method = req.body.method;
  if (!['UPI','Debit Card','Credit Card'].includes(method)) return res.status(400).json({ message: 'Choose a valid payment method.' });
  // Demo-only mock payment. No card number, CVV, PIN or bank credentials are collected.
  const success = req.body.simulateFailure !== true;
  await Payment.create({ booking: booking._id, user: req.account._id, method, amount: booking.fare, status: success ? 'Success' : 'Failed', reference: `MOCK-${crypto.randomBytes(6).toString('hex').toUpperCase()}` });
  booking.paymentStatus = success ? 'Paid' : 'Failed';
  booking.status = success ? 'Confirmed' : 'Pending Payment';
  await booking.save();
  res.json({ success, message: success ? 'Mock payment successful.' : 'Mock payment failed.', booking });
};
exports.cancel = async (req, res) => {
  const booking = await Booking.findOne({ pnr: req.params.pnr, user: req.account._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found for your account.' });
  if (booking.status === 'Cancelled') return res.status(409).json({ message: 'This booking is already cancelled.' });
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      booking.status = 'Cancelled';
      if (booking.paymentStatus === 'Paid') booking.paymentStatus = 'Refunded';
      await booking.save({ session });
      await Schedule.updateOne({ _id: booking.schedule, 'availability.code': booking.travelClass },
        { $inc: { 'availability.$.seats': booking.passengers.length } }, { session });
      await Cancellation.create([{ booking: booking._id, pnr: booking.pnr, refundAmount: booking.paymentStatus === 'Refunded' ? booking.fare : 0 }], { session });
    });
  } finally { await session.endSession(); }
  res.json({ message: 'Booking cancelled successfully.', booking });
};
exports.adminAll = async (req, res) => res.json(await Booking.find().populate('user', 'name email').populate('train passengers').sort({ createdAt: -1 }));
