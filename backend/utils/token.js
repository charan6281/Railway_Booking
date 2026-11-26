const jwt = require('jsonwebtoken');
module.exports = account => jwt.sign({ id: account._id, role: account.role || 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
