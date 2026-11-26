const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const tokenFor = require('../utils/token');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  const { name, email, phone, password } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email is already registered.' });
  const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: tokenFor(user), user: { id: user._id, name, email, phone } });
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
};
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!admin || !(await bcrypt.compare(password || '', admin.password))) return res.status(401).json({ message: 'Invalid administrator credentials.' });
  res.json({ token: tokenFor(admin), user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
};
exports.me = async (req, res) => res.json({ user: { id: req.account._id, name: req.account.name, email: req.account.email, role: req.role } });
