const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function authenticate(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = decoded.role === 'admin' ? Admin : User;
    const account = await Model.findById(decoded.id);
    if (!account) return res.status(401).json({ message: 'Account no longer exists.' });
    req.account = account;
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}
function adminOnly(req, res, next) {
  if (req.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}
module.exports = { authenticate, adminOnly };
